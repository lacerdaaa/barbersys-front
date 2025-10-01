import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { Role } from "../models/user";
import { Loader2, ShieldCheck, Users, UserRound } from "lucide-react";

const roleOptions = [
  {
    role: Role.CLIENT,
    label: "Cliente",
    description: "Agende horários e acompanhe seus atendimentos.",
    icon: Users,
  },
  {
    role: Role.BARBER,
    label: "Barbeiro",
    description: "Gerencie sua agenda em uma barbearia cadastrada.",
    icon: UserRound,
  },
  {
    role: Role.OWNER,
    label: "Dono de Barbearia",
    description: "Cadastre sua barbearia e convide sua equipe.",
    icon: ShieldCheck,
  },
] as const;

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, token, isLoading, error, clearError } = useAuthStore((state) => ({
    register: state.register,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
  }));

  const initialRoleFromQuery = useMemo(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === Role.BARBER || roleParam === Role.OWNER || roleParam === Role.CLIENT) {
      return roleParam;
    }
    return Role.CLIENT;
  }, [searchParams]);

  const [selectedRole, setSelectedRole] = useState<Role>(initialRoleFromQuery);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [barberShopId, setBarberShopId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    setSelectedRole(initialRoleFromQuery);
  }, [initialRoleFromQuery]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("As senhas precisam ser iguais.");
      return;
    }

    await register({
      name,
      email,
      password,
      role: selectedRole,
      barberShopId: barberShopId ? barberShopId : undefined,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta no FindCut</h1>
          <p className="mt-2 text-sm text-gray-600">
            Escolha o perfil adequado para aproveitar todos os recursos da plataforma.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {roleOptions.map(({ role, label, description, icon: Icon }) => {
            const isActive = role === selectedRole;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className={`mb-3 inline-flex rounded-full p-2 ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-gray-900">{label}</div>
                <p className="mt-1 text-xs text-gray-600">{description}</p>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="sm:col-span-1">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Nome completo
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmar senha
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {selectedRole !== Role.CLIENT && (
            <div className="sm:col-span-2">
              <label htmlFor="barbershop-id" className="mb-1 block text-sm font-medium text-gray-700">
                Código da barbearia (opcional)
              </label>
              <input
                id="barbershop-id"
                value={barberShopId}
                onChange={(event) => setBarberShopId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informe o código enviado pelo dono da barbearia"
              />
            </div>
          )}

          {(formError || error) && (
            <div className="sm:col-span-2">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError ?? error}
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              Criar conta
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já possui uma conta? {" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
