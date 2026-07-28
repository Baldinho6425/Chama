export default function SelecionarSala({ salas, bloco, sala, onChangeBloco, onChangeSala }) {
  if (salas.length === 0) {
    return (
      <p className="mensagem-aviso">
        Nenhuma sala cadastrada ainda. Cadastre uma na aba "Salas" antes de abrir uma demanda.
      </p>
    )
  }

  const blocos = [...new Set(salas.map((s) => s.bloco).concat(bloco ? [bloco] : []))].sort((a, b) =>
    a.localeCompare(b)
  )
  const salasDoBloco = salas.filter((s) => s.bloco === bloco)
  if (bloco && sala && !salasDoBloco.some((s) => s.sala === sala)) {
    salasDoBloco.push({ id: `atual-${sala}`, bloco, sala })
  }

  return (
    <>
      <div className="campo">
        <label htmlFor="select-bloco">Bloco</label>
        <select id="select-bloco" value={bloco} onChange={(e) => onChangeBloco(e.target.value)}>
          <option value="" disabled>
            Selecione
          </option>
          {blocos.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="select-sala">Sala</label>
        <select
          id="select-sala"
          value={sala}
          onChange={(e) => onChangeSala(e.target.value)}
          disabled={!bloco}
        >
          <option value="" disabled>
            Selecione
          </option>
          {salasDoBloco.map((s) => (
            <option key={s.id} value={s.sala}>
              {s.sala}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
