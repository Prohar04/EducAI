import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import prisma from './database.ts';
import logger from './logger.ts';
import { CreateGoogleUser } from '#src/services/google.service.ts';
import { findUserByEmail, findUserById } from '#src/services/user.service.ts';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:8000/auth/google/callback';

export const GOOGLE_OAUTH_ENABLED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (!GOOGLE_OAUTH_ENABLED) {
  logger.warn('[google.config] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled');
}

if (GOOGLE_OAUTH_ENABLED) passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (
      request: any,
      accessToken: any,
      refreshToken: any,
      profile: any,
      done: any
    ) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error('No email returned from Google.'), null);
        }

        let user = await findUserByEmail(email);

        if (user) {
          if (user.oauthProvider === 'google') {
            // A) Already a Google account — ensure oauthId is populated
            if (!user.oauthId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { oauthId: profile.id },
              });
            } else if (user.oauthId !== profile.id) {
              // oauthId mismatch — keep existing, log but do not crash
              logger.warn(`[google.config] oauthId mismatch for user ${user.id}: stored="${user.oauthId}" vs profile="${profile.id}". Keeping stored value.`);
            }
            return done(null, user);
          } else if (!user.oauthProvider) {
            // B) Password account — link to Google
            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: {
                oauthProvider: 'google',
                oauthId: profile.id,
                emailVerified: true,
                avatarUrl: user.avatarUrl || profile.photos?.[0]?.value || null,
                name: user.name || profile.displayName || null,
              },
            });
            return done(null, updatedUser);
          } else {
            // C) Account exists with a different OAuth provider
            return done(
              new Error(
                'Account exists with another provider. Use that method.'
              ),
              null
            );
          }
        } else {
          // New user — create via Google
          user = await CreateGoogleUser(profile);
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
