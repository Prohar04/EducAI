"use client"
import dynamic from "next/dynamic"

const LandingClient = dynamic(
  () => import("@/components/home/LandingClient"),
  { loading: () => null, ssr: false }
)

interface LandingClientWrapperProps {
  isLoggedIn: boolean
}

export default function LandingClientWrapper({ isLoggedIn }: LandingClientWrapperProps) {
  return <LandingClient isLoggedIn={isLoggedIn} />
}
