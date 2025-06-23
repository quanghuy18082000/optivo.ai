import { useForm, useField } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { ref } from 'vue'

export function useAuthForm() {
  const schema = toTypedSchema(
    z.object({
      username: z.string().min(3, 'required'),
      password: z.string().min(6, 'required'),
    })
  )

  const { handleSubmit, errors } = useForm({ validationSchema: schema })
  const { value: username } = useField('username')
  const { value: password } = useField('password')
  const error = ref(null)

  return { username, password, errors, handleSubmit, error }
}