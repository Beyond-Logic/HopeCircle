import AuthLayout from "./(auth)/layout";
import { Login } from "./(auth)/login/_components";

export default function Home() {
  return (
    <AuthLayout>
      <Login />
    </AuthLayout>
  );
}
