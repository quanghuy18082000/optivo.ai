import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { ref } from 'vue'

export function useAuthForm() {
  // Create validation schema using Yup
  const schema = toTypedSchema(
    yup.object({
      username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
      password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    })
  )

  // Initialize form with validation - only validate when explicitly called
  const { handleSubmit, errors, validate } = useForm({
    validationSchema: schema,
    validateOnMount: false,
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  })
  
  const { value: username } = useField('username')
  const { value: password } = useField('password')
  const error = ref(null)

  return { username, password, errors, handleSubmit, validate, error }
}