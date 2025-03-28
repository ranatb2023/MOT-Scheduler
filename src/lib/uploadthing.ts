import { generateComponents } from '@uploadthing/react'
import { generateReactHelpers } from '@uploadthing/react/hooks'

import { OurFilerouter } from '@/app/api/uploadthing/core'

export const { UploadButton, UploadDropzone, Uploader } = generateComponents<OurFilerouter>()

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFilerouter>()