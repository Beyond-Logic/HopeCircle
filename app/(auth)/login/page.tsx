import React from 'react'
import { Login } from './_components'
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Login | HopeCircle",
};

export default function LoginPage() {
  return (
    <Login/>
  )
}
