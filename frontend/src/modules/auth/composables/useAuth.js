import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '../store'
import { login } from '../services/authService'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      authStore.login({ username: data.username }, 'user')
      router.push('/dashboard')
    },
    onError: (err) => {
      return err.message || 'invalid'
    },
  })

  const loginUser = (values) => {
    loginMutation.mutate(values)
  }

  return { loginUser, error: loginMutation.error }
}