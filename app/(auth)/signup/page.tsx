import React from 'react'
import { Signup } from './_components'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Signup | HopeCircle",
};

export default function SignupPage() {
  return (
   <Signup/>
  )
}
