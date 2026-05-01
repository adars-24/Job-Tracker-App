import toast from "react-hot-toast"

export const showSuccess = (message: string): void => {
  toast.success(message)
}

export const showError = (message: string): void => {
  toast.error(message)
}

export const showLoading = (message: string): string => {
  return toast.loading(message)
}

export const dismissToast = (id: string): void => {
  toast.dismiss(id)
}