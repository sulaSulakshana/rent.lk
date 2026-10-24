
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-700">
            Rent.lk
          </h1>

          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Admin Panel
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your rental portfolio
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

      </div>
    </main>
  );
}
