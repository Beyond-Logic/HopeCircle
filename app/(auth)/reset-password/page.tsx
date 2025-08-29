import React from 'react'
import { ResetPassword } from './_components'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Reset Password | HopeCircle",
};

export default function ResetPasswordPage() {
  return <ResetPassword />
}
