function Svg({ children, ...props }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconeEmail(props) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </Svg>
  )
}

export function IconeCadeado(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  )
}

export function IconePessoa(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
  )
}

export function IconeOlho(props) {
  return (
    <Svg {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function IconeOlhoFechado(props) {
  return (
    <Svg {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.6 20.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.6 20.6 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </Svg>
  )
}

export function IconeMenu(props) {
  return (
    <Svg {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  )
}

export function IconeSino(props) {
  return (
    <Svg {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Svg>
  )
}

export function IconeMais(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconeComentario(props) {
  return (
    <Svg {...props}>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3v-3.5A8.5 8.5 0 1 1 21 11.5Z" />
    </Svg>
  )
}

export function IconePredio(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
    </Svg>
  )
}

export function IconePorta(props) {
  return (
    <Svg {...props}>
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <path d="M14 12h.01" />
    </Svg>
  )
}

export function IconeLista(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  )
}

export function IconeGrafico(props) {
  return (
    <Svg {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 16v-4M12 16V8M17 16v-7" />
    </Svg>
  )
}

export function IconePessoas(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M16 4.2a3.2 3.2 0 0 1 0 6.2" />
      <path d="M18 14.3c2 .5 3.5 2.7 3.5 5.7" />
    </Svg>
  )
}
