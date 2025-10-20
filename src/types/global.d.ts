declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string)
    getGenerativeModel(opts: { model: string }): any
  }
}

declare module 'date-fns-tz' {
  export function zonedTimeToUtc(date: Date | string, timeZone: string): Date
  export function utcToZonedTime(date: Date | string, timeZone: string): Date
}

declare module '@radix-ui/react-textarea' {
  import * as React from 'react'
  export const Root: React.ComponentType<any>
  export type TextareaProps = any
}

// allow imports of modules without types for now
declare module 'nativewind/babel'
