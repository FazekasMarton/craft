import { error } from "./error"

interface errorProps {
    error: error | null,
    setError: (value: error | null) => void
}

export type { errorProps }