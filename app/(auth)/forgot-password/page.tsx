import React from 'react'
import { ForgotPassword } from './_components'
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Forgot Password | HopeCircle",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword/>
}
