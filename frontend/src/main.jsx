import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  DoorOpen,
  Layers,
  Users,
  History,
  Settings,
  Sun,
  Moon,
  LogOut,
  Plus,
  KeyRound,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import "./style.css";
import { FLOORS, normalizeFloor, floorImage } from "./floors";
import { ROOM_STATUSES, roomStatus, roomUsage, hasMapPosition, markerPosition, relativePosition } from "./room-status";
let csrf = "";
async function api(action, body) {
  const r = await fetch(`../api.php?acao=${action}`, {
    credentials: "same-origin",
    method: body ? "POST" : "GET",
    headers: body
      ? { "Content-Type": "application/json", "X-CSRF-Token": csrf }
      : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error(data.mensagem || "Falha na comunicação");
    e.status = r.status;
    throw e;
  }
  return data;
}
const labels = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  manutencao: "Manutenção",
  erro: "Verificar",
  professor: "Professor",
  aluno: "Aluno autorizado",
  limpeza: "Limpeza",
  ti: "TI",
  completo: "Acesso completo",
};
function App() {
  const [op, setOp] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [tab, setTab] = useState("salas"),
    [data, setData] = useState({
      salas: [],
      cartoes: [],
      permissoes: [],
      dispositivos: [],
      comandos: [],
    }),
    [theme, setTheme] = useState(
      localStorage.getItem("clack-theme") || "light",
    ),
    [modal, setModal] = useState(null),
    [floor, setFloor] = useState(""),
    [history, setHistory] = useState({ eventos: [], auditoria: [] }),
    [filter, setFilter] = useState(""),
    [operators, setOperators] = useState([]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("clack-theme", theme);
  }, [theme]);
  const report = (e) => {
    setError(e.message);
    if (e.status === 401) setOp(null);
  };
  const refresh = async () => {
    try {
      setData(await api("painel"));
    } catch (e) {
      report(e);
    }
  };
  useEffect(() => {
    api("sessao")
      .then((s) => {
        csrf = s.csrf;
        setOp(s.operador);
      })
      .catch((e) => {
        if (e.status !== 401) report(e);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!op) return;
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [op]);
  useEffect(() => {
    if (op && tab === "historico")
      api(`historico${filter ? "&sala=" + filter : ""}`)
        .then(setHistory)
        .catch(report);
    if (op && tab === "admin")
      api("operadores")
        .then((d) => setOperators(d.operadores))
        .catch(report);
  }, [tab, op, filter]);
  async function save(action, body) {
    setError("");
    try {
      const r = await api(action, body);
      setNotice(
        action === "posicao_sala" ? "Posição na planta salva." : "Alteração salva. Permissões chegam às trancas na próxima sincronização.",
      );
      await refresh();
      return r;
    } catch (e) {
      report(e);
      throw e;
    }
  }
  const currentFloor = FLOORS.includes(floor) ? floor : FLOORS[0];
  const rooms = data.salas.filter((s) => normalizeFloor(s.andar) === currentFloor);
  const unmappedRooms = data.salas.filter((s) => !normalizeFloor(s.andar));
  if (loading)
    return (
      <main className="login">
        <p>Carregando Clack…</p>
      </main>
    );
  if (!op)
    return (
      <main className="login">
        <form
          className="login-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const f = new FormData(e.target);
            try {
              const s = await api("login", Object.fromEntries(f));
              csrf = s.csrf;
              setOp(s.operador);
            } catch (e) {
              report(e);
            }
          }}
        >
          <div className="brand">
            <DoorOpen /> clack<span>PORTARIA</span>
          </div>
          <h1>Bem-vindo à portaria.</h1>
          <p>Entre para acompanhar os ambientes e gerenciar acessos.</p>
          <label>
            Login
            <input name="login" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input
              name="senha"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button>Entrar</button>
          <small>Uso local · IFSul</small>
        </form>
      </main>
    );
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <DoorOpen /> clack
        </div>
        <span className="eyebrow">CONTROLE DE ACESSO</span>
        <nav>
          {[
            ["salas", Layers, "Ambientes"],
            ["cartoes", Users, "Cartões"],
            ["historico", History, "Histórico"],
            ...(op.papel === "admin"
              ? [["admin", Settings, "Configurações"]]
              : []),
          ].map(([key, Icon, label]) => (
            <button
              className={tab === key ? "selected" : ""}
              key={key}
              onClick={() => setTab(key)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="account">
          <strong>{op.nome}</strong>
          <small>{op.papel === "admin" ? "Administrador" : "Portaria"}</small>
          <button
            className="quiet"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}Modo{" "}
            {theme === "light" ? "escuro" : "claro"}
          </button>
          <button
            className="quiet"
            onClick={() => setModal({ kind: "password" })}
          >
            Alterar senha
          </button>
          <button
            className="quiet"
            onClick={() =>
              api("logout", {})
                .then(() => {
                  csrf = "";
                  setOp(null);
                })
                .catch(report)
            }
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">
              CLACK / {tab === "salas" ? "VISÃO GERAL" : tab.toUpperCase()}
            </span>
            <h1>
              {
                {
                  salas: "Ambientes do campus",
                  cartoes: "Cartões de acesso",
                  historico: "Histórico de atividades",
                  admin: "Configurações",
                }[tab]
              }
            </h1>
          </div>
          <span className="local">
            <i />
            Servidor local
          </span>
        </header>
        {error && (
          <div role="alert" className="error">
            {error}
            <button className="quiet" onClick={() => setError("")}>
              Fechar
            </button>
          </div>
        )}
        {notice && (
          <div role="status" className="notice">
            {notice}
            <button className="quiet" onClick={() => setNotice("")}>
              Fechar
            </button>
          </div>
        )}
        {tab === "salas" && (
          <>
            <div className="stats">
              {ROOM_STATUSES.map((status) => (
                <section key={status.key}>
                  <span className={"dot occupancy-" + status.key} />
                  <span>{status.label}</span>
                  <strong>
                    {data.salas.filter((s) => roomStatus(s).key === status.key).length}
                  </strong>
                </section>
              ))}
            </div>
            <p className="muted campus-alerts">
              Manutenção: {data.salas.filter(s => s.estado === "manutencao").length} ·
              Verificar: {data.salas.filter(s => s.estado === "erro").length} ·
              Sem conexão recente: {data.salas.filter(s => !Number(s.online)).length}.
              O estado offline não altera a última atividade registrada.
            </p>
            <section className="panel">
              <div className="toolbar">
                <div>
                  <h2>Planta baixa do IFSul</h2>
                  <p>Selecione um andar para consultar a planta e suas salas.</p>
                </div>
                <select
                  aria-label="Andar"
                  value={currentFloor}
                  onChange={(e) => setFloor(e.target.value)}
                >
                  {FLOORS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <FloorPlan key={currentFloor} floor={currentFloor} rooms={rooms}
                canEdit={op.papel === "admin"} save={save}
                onSelect={room => setModal({ kind: "room", value: room })} />
              <div className="floor-caption">
                <strong>{currentFloor}</strong>
                <span>{rooms.length} {rooms.length === 1 ? "sala cadastrada" : "salas cadastradas"}</span>
              </div>
            </section>
            {!rooms.length && <p className="muted">Nenhuma sala cadastrada neste andar.</p>}
            <div className="room-grid">
              {rooms.map((s) => (
                <button
                  className="room-card"
                  key={s.id}
                  onClick={() => setModal({ kind: "room", value: s })}
                >
                  <span className={"badge occupancy-" + roomStatus(s).key}>
                    {roomStatus(s).label}
                  </span>
                  <h3>{s.nome}</h3>
                  <p>
                    {s.andar} · {s.responsavel_nome || "Sem responsável"}
                  </p>
                  <small>
                    {Number(s.online)
                      ? "Dispositivo conectado"
                      : "Offline / não configurado"}
                  </small>
                </button>
              ))}
            </div>
            {unmappedRooms.length > 0 && <p className="notice">
              Salas com andar ainda não padronizado: {unmappedRooms.map(s => `${s.nome} (${s.andar})`).join(", ")}. Ajuste o andar em Configurações.
            </p>}
          </>
        )}
        {tab === "cartoes" && (
          <section className="panel">
            <div className="toolbar">
              <p>Perfis predefinidos, permissões ajustadas por ambiente.</p>
              <button onClick={() => setModal({ kind: "card", value: null })}>
                <Plus size={17} />
                Novo cartão
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th>Perfil</th>
                    <th>Cartão</th>
                    <th>Situação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.cartoes.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.nome}</strong>
                        <small>
                          {Number(c.externo) ? "Externo · NDA" : c.matricula}
                        </small>
                      </td>
                      <td>{labels[c.perfil]}</td>
                      <td>{c.uid || "Desvinculado"}</td>
                      <td>{Number(c.ativo) ? "Ativo" : "Bloqueado"}</td>
                      <td>
                        <button
                          className="quiet"
                          onClick={() => setModal({ kind: "card", value: c })}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.cartoes.length && (
              <div className="empty">
                Os cartões cadastrados aparecerão aqui.
              </div>
            )}
          </section>
        )}
        {tab === "historico" && (
          <>
            <section className="panel">
              <div className="toolbar">
                <h2>Eventos dos dispositivos</h2>
                <select
                  aria-label="Filtrar sala"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Todas as salas</option>
                  {data.salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
                <button
                  className="quiet"
                  onClick={() =>
                    api(`historico${filter ? "&sala=" + filter : ""}`)
                      .then(setHistory)
                      .catch(report)
                  }
                >
                  Atualizar
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Horário do evento</th>
                      <th>Sala</th>
                      <th>Pessoa</th>
                      <th>Resultado</th>
                      <th>Recebido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.eventos.map((e) => (
                      <tr key={e.id}>
                        <td>{date(e.ocorrido_em)}</td>
                        <td>{e.sala}</td>
                        <td>{e.nome || "Portaria / sistema"}</td>
                        <td>{e.resultado}</td>
                        <td>{date(e.recebido_em)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.eventos.length === 100 && (
                <button
                  className="quiet"
                  onClick={() =>
                    api(
                      `historico&antes=${history.eventos.at(-1).id}${filter ? "&sala=" + filter : ""}`,
                    )
                      .then(setHistory)
                      .catch(report)
                  }
                >
                  Eventos anteriores
                </button>
              )}
              <p className="muted">
                Sem relógio válido no dispositivo, o horário do evento fica
                desconhecido; a ordem é preservada pela sequência.
              </p>
            </section>
            <section className="panel">
              <h2>Ações da portaria</h2>
              {history.auditoria.map((a) => (
                <div className="audit" key={a.id}>
                  <strong>{a.operador}</strong>
                  <span>{a.acao.replaceAll("_", " ")}</span>
                  <small>{date(a.criado_em)}</small>
                </div>
              ))}
            </section>
          </>
        )}
        {tab === "admin" && (
          <>
            <section className="panel">
              <div className="toolbar">
                <h2>Ambientes e dispositivos</h2>
                <div className="actions">
                  <button
                    onClick={() =>
                      setModal({ kind: "environment", value: null })
                    }
                  >
                    Cadastrar sala
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setModal({ kind: "device" })}
                  >
                    Cadastrar dispositivo
                  </button>
                </div>
              </div>
              {data.salas.map((s) => (
                <div className="audit" key={s.id}>
                  <strong>{s.nome}</strong>
                  <span>
                    {s.andar} · {s.categoria}
                  </span>
                  <button
                    className="quiet"
                    onClick={() => setModal({ kind: "environment", value: s })}
                  >
                    Editar posição
                  </button>
                </div>
              ))}
              {data.dispositivos.map((d) => (
                <div className="audit" key={"d" + d.id}>
                  <KeyRound size={17} />
                  <strong>
                    #{d.id} {d.nome}
                  </strong>
                  <span>{d.tipo}</span>
                  <small>{date(d.ultima_conexao)}</small>
                  <button
                    className="quiet"
                    onClick={() => setModal({ kind: "rotate", value: d })}
                  >
                    Trocar token
                  </button>
                </div>
              ))}
            </section>
            <section className="panel">
              <div className="toolbar">
                <h2>Contas da portaria</h2>
                <button onClick={() => setModal({ kind: "operator" })}>
                  Nova conta
                </button>
              </div>
              {operators.map((o) => (
                <div className="audit" key={o.id}>
                  <strong>{o.nome}</strong>
                  <span>
                    {o.papel} · {Number(o.ativo) ? "Ativo" : "Bloqueado"}
                  </span>
                  {o.id !== op.id && Number(o.ativo) > 0 && (
                    <button
                      className="quiet"
                      onClick={() => {
                        if (confirm("Bloquear acesso de " + o.nome + "?"))
                          save("bloquear_operador", { id: o.id })
                            .then(() => api("operadores"))
                            .then((d) => setOperators(d.operadores))
                            .catch(() => {});
                      }}
                    >
                      Bloquear
                    </button>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      {modal && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes e cadastro"
          >
            <button
              className="close quiet"
              aria-label="Fechar"
              onClick={() => setModal(null)}
            >
              ×
            </button>
            {modal.kind === "room" ? (
              <Room
                room={
                  data.salas.find((s) => s.id === modal.value.id) || modal.value
                }
                commands={data.comandos}
                save={save}
              />
            ) : modal.kind === "card" ? (
              <Card
                value={modal.value}
                data={data}
                save={save}
                report={report}
                close={() => setModal(null)}
              />
            ) : (
              <Setup
                kind={modal.kind}
                value={modal.value}
                data={data}
                save={save}
                close={() => {
                  setModal(null);
                  if (tab === "admin")
                    api("operadores")
                      .then((d) => setOperators(d.operadores))
                      .catch(report);
                }}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function OccupancyDetails({ room }) {
  const status = roomStatus(room);
  const usage = roomUsage(room);
  return <div className="occupancy-details">
    <span className={`badge occupancy-${status.key}`}>{status.label}</span>
    {usage ? <dl>
      <div><dt>Responsável</dt><dd>{usage.name}</dd></div>
      <div><dt>Matrícula</dt><dd>{usage.enrollment}</dd></div>
      <div><dt>Em uso desde</dt><dd>{usage.since}</dd></div>
      {usage.received && <div><dt>Registro recebido</dt><dd>{usage.received} (não é o horário de início)</dd></div>}
    </dl> : <p>{room.estado === "disponivel" ? "Sem atividade em andamento." : "Sala indisponível para iniciar uma atividade."}</p>}
    {!Number(room.online) && <p className="muted">Dispositivo sem conexão recente. Informação da última sincronização.</p>}
  </div>;
}
function FloorPlan({ floor, rooms = [], canEdit = false, save, onSelect }) {
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [peek, setPeek] = useState(null);
  const [peekAnchor, setPeekAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [placing, setPlacing] = useState("");
  const [savingPosition, setSavingPosition] = useState(false);
  const [imageRatio, setImageRatio] = useState(1491 / 1055);
  const [portrait, setPortrait] = useState(false);
  const [fitWidth, setFitWidth] = useState(0);
  const viewport = useRef(null);
  const ordered = [...rooms].sort((a, b) => Number(a.id) - Number(b.id));
  const shownRoom = rooms.find(room => room.id === peek);
  const unpositioned = rooms.filter(room => !hasMapPosition(room));
  const placementRoom = rooms.find(room => String(room.id) === placing);
  function reveal(room, event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPeekAnchor({
      left: Math.max(8, Math.min(window.innerWidth - 288, rect.left + rect.width / 2 - 140)),
      top: window.innerHeight - rect.bottom >= 310 ? rect.bottom + 8 : Math.max(8, rect.top - 310),
    });
    setPeek(room.id);
  }
  async function place(event) {
    if (!placementRoom || savingPosition) return;
    const coordinates = relativePosition(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (!coordinates) return;
    setSavingPosition(true);
    try { await save("posicao_sala", { id: placementRoom.id, ...coordinates }); }
    catch { /* O painel já apresenta o erro retornado pelo servidor. */ }
    finally { setSavingPosition(false); }
  }
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const fit = () => setFitWidth(Math.min(element.clientWidth, window.innerHeight * .6 * imageRatio));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    window.addEventListener("resize", fit);
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, [imageRatio, failed]);
  useEffect(() => {
    const element = viewport.current;
    if (element) {
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
      if (zoom === 1) element.scrollTop = 0;
    }
  }, [zoom]);
  const src = floorImage(floor);
  if (src && !failed) return <div className="floor-viewer" aria-label={`Planta baixa — ${floor}`}>
    <div className="floor-legend" aria-label="Legenda de disponibilidade">
      {ROOM_STATUSES.map(status => <span key={status.key}><i className={`legend-square occupancy-${status.key}`} aria-hidden="true" />{status.label}</span>)}
      <span><i className="legend-square occupancy-maintenance" aria-hidden="true" />Manutenção / verificar</span>
    </div>
    <div className="floor-tools">
      <span>Planta do {floor.toLowerCase()}</span>
      <div className="actions">
        <button type="button" className="quiet" aria-label="Diminuir zoom" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1,z-.5))}><ZoomOut size={18}/></button>
        <output aria-live="polite" aria-label="Nível de zoom">{Math.round(zoom*100)}%</output>
        <button type="button" className="quiet" aria-label="Aumentar zoom" disabled={zoom >= 3} onClick={() => setZoom(z => Math.min(3,z+.5))}><ZoomIn size={18}/></button>
        <button type="button" className="quiet" onClick={() => setZoom(1)}><Maximize2 size={16}/>Ajustar</button>
        <a className="floor-original" href={src} target="_blank" rel="noopener noreferrer">Abrir imagem</a>
        {canEdit && <button type="button" className="secondary" disabled={!rooms.length}
          aria-pressed={editing} onClick={() => {
            setEditing(value => !value); setPeek(null);
            if (!placing) setPlacing(String(unpositioned[0]?.id || rooms[0]?.id || ""));
          }}>{editing ? "Concluir posicionamento" : "Posicionar salas"}</button>}
      </div>
    </div>
    {editing && <div className="map-editor">
      <label>Sala para posicionar
        <select aria-label="Sala para posicionar" value={placing} disabled={savingPosition} onChange={event => setPlacing(event.target.value)}>
          {rooms.map(room => <option key={room.id} value={room.id}>{room.nome}{!hasMapPosition(room) ? " — posição provisória" : ""}</option>)}
        </select>
      </label>
      <p role="status">{savingPosition ? "Salvando posição…" : `Clique no centro de ${placementRoom?.nome || "uma sala"} na planta para salvar o quadrado. O posicionamento não abre a tranca.`}</p>
      <small>Para posicionar usando o teclado, abra Configurações → Editar posição e informe X/Y em porcentagem.</small>
    </div>}
    <div ref={viewport} className="floor-viewport" tabIndex="0" aria-label="Planta ampliável; use a rolagem para explorar" onWheel={() => setPeek(null)}>
      <div className="floor-image-stage" style={{width: fitWidth ? `${fitWidth * zoom}px` : `${zoom*100}%`, aspectRatio: imageRatio, "--plan-ratio": imageRatio}}>
        <img className={`floor-plan-image${portrait ? " portrait" : ""}`} src={src} alt={`Planta baixa do IFSul — ${floor}`}
          onLoad={event => {
            const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
            setPortrait(height > width);
            setImageRatio(Math.max(width, height) / Math.min(width, height));
          }} onError={() => setFailed(true)} />
        {editing && <button type="button" className="map-placement-surface" tabIndex={-1} disabled={savingPosition || !placementRoom}
          aria-label="Clique na planta para posicionar a sala selecionada" onClick={place} />}
        {ordered.map((room, index) => {
          const position = markerPosition(room, index, floor);
          const status = roomStatus(room);
          return <button key={room.id} type="button"
            className={`room-marker occupancy-${status.key}${position.provisional ? " provisional" : ""}${editing && placing === String(room.id) ? " placing" : ""}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            data-room-id={room.id} data-provisional={position.provisional}
            aria-label={`${room.nome} — ${status.label}${position.provisional ? " — posição provisória" : ""}`}
            aria-describedby={shownRoom?.id === room.id ? `room-preview-${floor.replace(" ", "-")}` : undefined}
            onMouseEnter={event => reveal(room, event)} onMouseLeave={() => setPeek(null)}
            onFocus={event => reveal(room, event)} onBlur={() => setPeek(null)}
            onKeyDown={event => { if (event.key === "Escape") setPeek(null); }}
            onClick={() => { setPeek(null); if (editing) setPlacing(String(room.id)); else onSelect?.(room); }}>
            <span aria-hidden="true">{status.key === "maintenance" || status.key === "unknown" ? "!" : ""}</span>
            <span className="marker-label" aria-hidden="true">{room.nome}</span>
          </button>;
        })}
      </div>
    </div>
    {shownRoom && peekAnchor && !editing && <div className="room-hover-popover" style={peekAnchor} aria-hidden="true">
      <h3>{shownRoom.nome}</h3><OccupancyDetails room={shownRoom} />
    </div>}
    <div className="room-map-preview" id={`room-preview-${floor.replace(" ", "-")}`} aria-live="polite">
      {shownRoom ? <><h3>{shownRoom.nome}</h3><OccupancyDetails room={shownRoom} /></> :
        <p>Passe o mouse ou use Tab nos quadrados para consultar responsável, matrícula e horário. Clique/toque para abrir os detalhes.</p>}
    </div>
    {unpositioned.length > 0 && <p className="map-position-warning">
      {unpositioned.length} {unpositioned.length === 1 ? "sala com posição provisória" : "salas com posições provisórias"} (borda tracejada).
      Os pontos sugeridos não confirmam a localização real. {canEdit ? "Use Posicionar salas para associar cada cadastro ao centro correto." : "Peça ao administrador para confirmar as posições."}
    </p>}
    <p className="muted floor-hint">Amplie para ver os detalhes e use a rolagem para percorrer a planta. As cores representam atividades registradas, não a posição física da porta.</p>
  </div>;
  return <div className="floor-plan" aria-label={`Planta baixa — ${floor}`}>
    <div className="floor-placeholder">
      <div className="floor-placeholder-icon"><ImageIcon size={32} aria-hidden="true" /></div>
      <span className="eyebrow">IFSUL · {floor.toUpperCase()}</span>
      <h3>{failed ? "Planta indisponível" : "A planta deste andar vem aqui"}</h3>
      <p>{failed ? "Não foi possível carregar a imagem deste andar." : "Espaço reservado para a imagem da planta baixa do campus."}</p>
      <span className="floor-pending">{failed ? "Imagem não carregada" : "Aguardando planta baixa"}</span>
    </div>
  </div>;
}
function date(s) {
  return s
    ? new Date(s.replace(" ", "T") + "Z").toLocaleString("pt-BR")
    : "Desconhecido";
}
function Room({ room: s, commands, save }) {
  return (
    <>
      <h2>{s.nome}</h2>
      <p>{s.andar}</p>
      <OccupancyDetails room={s} />
      <p>Última conexão: {date(s.ultima_conexao)}</p>
      <p>
        Intervenções ficam registradas em seu nome. A confirmação indica
        execução do comando pelo dispositivo, sem sensor mecânico.
      </p>
      <div className="actions">
        {[
          ["abrir", "Destrancar"],
          ["fechar", "Encerrar e trancar"],
          ["manutencao", "Trancar para manutenção"],
          ["liberar", "Encerrar manutenção"],
        ].map(([cmd, label]) => (
          <button
            key={cmd}
            disabled={!Number(s.online)}
            onClick={() => {
              if (confirm(label + " " + s.nome + "?"))
                save("comando", { sala: s.id, comando: cmd }).catch(() => {});
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <h3>Comandos recentes</h3>
      {commands
        .filter((c) => c.dispositivo_id === s.dispositivo_id)
        .slice(0, 5)
        .map((c) => (
          <p key={c.id}>
            {c.acao} ·{" "}
            {c.confirmado_em
              ? "Confirmado pelo dispositivo"
              : new Date(c.expira_em.replace(" ", "T") + "Z") < new Date()
                ? "Expirado"
                : "Aguardando confirmação"}
          </p>
        ))}
    </>
  );
}
function Card({ value, data, save, report, close }) {
  const [form, setForm] = useState(
      value
        ? {
            ...value,
            externo: !!Number(value.externo),
            ativo: !!Number(value.ativo),
            salas: data.permissoes
              .filter((p) => p.cartao_id === value.id)
              .map((p) => p.ambiente_id),
          }
        : {
            nome: "",
            matricula: "",
            externo: false,
            perfil: "professor",
            ativo: true,
            salas: data.salas
              .filter((s) => s.categoria === "aula")
              .map((s) => s.id),
          },
    ),
    [reader, setReader] = useState(
      data.dispositivos.find((d) => d.tipo === "cadastrador")?.id || "",
    ),
    [capture, setCapture] = useState(""),
    [uid, setUid] = useState("");
  useEffect(() => {
    if (!capture) return;
    const t = setInterval(
      () =>
        api("ler_captura", { captura: capture })
          .then((d) => setUid(d.uid || ""))
          .catch((e) => {
            report(e);
            setCapture("");
          }),
      1000,
    );
    return () => clearInterval(t);
  }, [capture]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save("cartao", { ...form, ...(capture ? { captura: capture } : {}) })
          .then(close)
          .catch(() => {});
      }}
    >
      <h2>{value ? "Editar cartão" : "Cadastrar cartão"}</h2>
      <label>
        Nome
        <input
          required
          maxLength="100"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={form.externo}
          onChange={(e) => set("externo", e.target.checked)}
        />
        Pessoa externa (NDA)
      </label>
      {!form.externo && (
        <label>
          Matrícula
          <input
            required
            maxLength="50"
            value={form.matricula || ""}
            onChange={(e) => set("matricula", e.target.value)}
          />
        </label>
      )}
      <label>
        Perfil
        <select
          aria-label="Perfil"
          value={form.perfil}
          onChange={(e) => set("perfil", e.target.value)}
        >
          {["professor", "aluno", "limpeza", "ti", "completo"].map((p) => (
            <option key={p} value={p}>
              {labels[p]}
            </option>
          ))}
        </select>
      </label>
      <h3>Salas permitidas</h3>
      {form.perfil === "ti" && <p className="notice">TI tem acesso a todas as salas, incluindo data center, estoque e novos ambientes. Não é necessário selecionar salas individualmente.</p>}
      <div className="actions">
        <button
          type="button"
          className="quiet"
          disabled={form.perfil === "ti"}
          onClick={() =>
            set(
              "salas",
              data.salas.filter((s) => s.categoria === "aula").map((s) => s.id),
            )
          }
        >
          Salas de aula
        </button>
        <button
          type="button"
          className="quiet"
          disabled={form.perfil === "ti"}
          onClick={() =>
            set(
              "salas",
              data.salas.map((s) => s.id),
            )
          }
        >
          Todas
        </button>
        <button
          type="button"
          className="quiet"
          disabled={form.perfil === "ti"}
          onClick={() => set("salas", [])}
        >
          Limpar
        </button>
      </div>
      <div className="room-options">
        {data.salas.map((s) => (
          <label className="check" key={s.id}>
            <input
              type="checkbox"
              checked={form.perfil === "ti" || form.salas.includes(s.id)}
              disabled={form.perfil === "ti"}
              onChange={(e) =>
                set(
                  "salas",
                  e.target.checked
                    ? [...form.salas, s.id]
                    : form.salas.filter((id) => id !== s.id),
                )
              }
            />
            {s.nome} · {s.andar}
          </label>
        ))}
      </div>
      <small>
        {form.perfil === "ti" ? "Acesso global da TI aplicado pelo servidor." : "O perfil não concede salas automaticamente. Confira a seleção acima."}
      </small>
      <label className="check">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => set("ativo", e.target.checked)}
        />
        Cartão ativo
      </label>
      <fieldset>
        <legend>Leitura na portaria</legend>
        <select
          aria-label="Cadastrador"
          value={reader}
          onChange={(e) => setReader(Number(e.target.value))}
        >
          <option value="">Selecione um cadastrador</option>
          {data.dispositivos
            .filter((d) => d.tipo === "cadastrador")
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="secondary"
          disabled={!reader || !!capture}
          onClick={() =>
            api("capturar", { dispositivo: reader })
              .then((d) => setCapture(d.captura))
              .catch(report)
          }
        >
          Iniciar leitura
        </button>
        <p>
          {uid
            ? "Cartão lido: " + uid
            : capture
              ? "Aproxime o cartão (até 2 minutos)."
              : value?.uid || "Nenhum cartão lido"}
        </p>
      </fieldset>
      <div className="actions">
        <button disabled={!!capture && !uid}>Salvar cadastro</button>
        {value && (
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (
                confirm("Desvincular este cartão? O histórico será preservado.")
              )
                save("resetar_cartao", { id: value.id })
                  .then(close)
                  .catch(() => {});
            }}
          >
            Desvincular cartão
          </button>
        )}
      </div>
    </form>
  );
}
function RoomPositionPicker({ floor, position, onPosition }) {
  const [ratio, setRatio] = useState(1491 / 1055);
  const [portrait, setPortrait] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const src = floorImage(floor);
  if (!src || failed) return <p className="muted">Planta indisponível. Informe a posição nos campos X/Y abaixo.</p>;
  const positioned = position.mapa_x !== "" && position.mapa_y !== "";
  return <div className="draft-room-position">
    <p> Clique no centro da sala na planta. Você pode clicar novamente para ajustar antes de salvar.</p>
    <div className="floor-tools">
      <span>{floor}</span>
      <div className="actions">
        <button type="button" className="quiet" aria-label="Diminuir zoom do cadastro" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .5))}><ZoomOut size={18}/></button>
        <output aria-label="Zoom do cadastro">{Math.round(zoom * 100)}%</output>
        <button type="button" className="quiet" aria-label="Aumentar zoom do cadastro" disabled={zoom >= 3} onClick={() => setZoom(z => Math.min(3, z + .5))}><ZoomIn size={18}/></button>
      </div>
    </div>
    <div className="floor-viewport">
      <div className="floor-image-stage" style={{ width: `${zoom * 100}%`, aspectRatio: ratio, "--plan-ratio": ratio }}>
        <img className={`floor-plan-image${portrait ? " portrait" : ""}`} src={src} alt={`Posicionar sala — ${floor}`} onError={() => setFailed(true)} onLoad={event => {
          const { naturalWidth: w, naturalHeight: h } = event.currentTarget;
          setPortrait(h > w); setRatio(Math.max(w, h) / Math.min(w, h));
        }}/>
        <button type="button" className="map-placement-surface" tabIndex={-1} aria-label="Definir posição da sala na planta" onClick={event => {
          const next = relativePosition(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
          if (next) onPosition(next);
        }}/>
        {positioned && <span className="draft-room-marker" style={{ left: `${position.mapa_x}%`, top: `${position.mapa_y}%` }} aria-hidden="true"/>}
      </div>
    </div>
    <p role="status">{positioned ? "Posição definida. Clique em Salvar para gravar o cadastro." : "Nenhuma posição escolhida. Também é possível preencher X/Y pelo teclado."}</p>
  </div>;
}
function Setup({ kind, value, data, save, close }) {
  const [result, setResult] = useState(null);
  const [setupFloor, setSetupFloor] = useState(normalizeFloor(value?.andar) || value?.andar || FLOORS[0]);
  const [setupPosition, setSetupPosition] = useState({ mapa_x: value?.mapa_x ?? "", mapa_y: value?.mapa_y ?? "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const b = Object.fromEntries(new FormData(e.target));
        if (value) b.id = value.id;
        if (kind === "environment") {
          b.x = Number(value?.x || 0);
          b.y = Number(value?.y || 0);
          b.mapa_x = b.mapa_x === "" ? null : Number(b.mapa_x);
          b.mapa_y = b.mapa_y === "" ? null : Number(b.mapa_y);
        }
        if (kind === "device" && b.sala) b.sala = Number(b.sala);
        save(
          {
            environment: "sala",
            operator: "operador",
            device: "dispositivo",
            password: "senha",
            rotate: "rotacionar_dispositivo",
          }[kind],
          b,
        )
          .then((r) =>
            ["device", "rotate"].includes(kind) ? setResult(r) : close(),
          )
          .catch(() => {});
      }}
    >
      <h2>
        {
          {
            environment: "Configurar ambiente",
            operator: "Conta da portaria",
            device: "Novo dispositivo",
            password: "Alterar senha",
            rotate: "Trocar credencial do dispositivo",
          }[kind]
        }
      </h2>
      {result ? (
        <>
          <p>
            Guarde esta credencial no arquivo local do dispositivo. Ela só
            aparece nesta resposta.
          </p>
          <label>
            ID
            <input readOnly value={result.id} />
          </label>
          <label>
            Token
            <textarea readOnly value={result.token} />
          </label>
          <button type="button" onClick={close}>
            Concluir
          </button>
        </>
      ) : (
        <>
          {!["password", "rotate"].includes(kind) && (
            <label>
              Nome
              <input
                name="nome"
                required
                maxLength={kind === "environment" ? 50 : 100}
                defaultValue={value?.nome}
              />
            </label>
          )}
          {kind === "password" && (
            <>
              <label>
                Senha atual
                <input
                  type="password"
                  name="atual"
                  required
                  autoComplete="current-password"
                />
              </label>
              <label>
                Nova senha
                <input
                  type="password"
                  name="nova"
                  required
                  minLength="12"
                  maxLength="72"
                  autoComplete="new-password"
                />
              </label>
            </>
          )}
          {kind === "rotate" && (
            <p>
              A credencial de {value.nome} será invalidada imediatamente. Você
              precisará atualizar o token no firmware. A sequência e o histórico
              serão preservados.
            </p>
          )}
          {kind === "environment" && (
            <>
              <label>
                Andar
                <select name="andar" required value={setupFloor} onChange={event => {
                  setSetupFloor(event.target.value);
                  setSetupPosition({ mapa_x: "", mapa_y: "" });
                }}>
                  {value?.andar && !normalizeFloor(value.andar) && <option value={value.andar}>{value.andar} (atual)</option>}
                  {FLOORS.map(f => <option key={f}>{f}</option>)}
                </select>
              </label>
              <label>
                Categoria
                <select
                  name="categoria"
                  defaultValue={value?.categoria || "aula"}
                >
                  <option value="aula">Sala de aula</option>
                  <option value="administrativa">Administrativa</option>
                  <option value="outra">Outra</option>
                </select>
              </label>
              <RoomPositionPicker key={setupFloor} floor={setupFloor} position={setupPosition} onPosition={setSetupPosition}/>
              <p className="muted">X/Y em porcentagem (0–100). Deixe ambos vazios para posicionar depois.</p>
              <div className="actions">
                <label>
                  X na planta (%)
                  <input
                    name="mapa_x"
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={setupPosition.mapa_x}
                    onChange={event => setSetupPosition(p => ({ ...p, mapa_x: event.target.value }))}
                  />
                </label>
                <label>
                  Y na planta (%)
                  <input
                    name="mapa_y"
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={setupPosition.mapa_y}
                    onChange={event => setSetupPosition(p => ({ ...p, mapa_y: event.target.value }))}
                  />
                </label>
              </div>
            </>
          )}
          {kind === "operator" && (
            <>
              <label>
                Login
                <input name="login" required autoComplete="off" />
              </label>
              <label>
                Senha inicial
                <input
                  name="senha"
                  type="password"
                  minLength="12"
                  maxLength="72"
                  required
                  autoComplete="new-password"
                />
              </label>
              <label>
                Papel
                <select name="papel">
                  <option value="portaria">Portaria</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
            </>
          )}
          {kind === "device" && (
            <>
              <label>
                Tipo
                <select name="tipo">
                  <option value="tranca">Tranca</option>
                  <option value="cadastrador">Cadastrador</option>
                </select>
              </label>
              <label>
                Sala (apenas tranca)
                <select name="sala">
                  <option value="">Selecione</option>
                  {data.salas
                    .filter((s) => !s.dispositivo_id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                </select>
              </label>
            </>
          )}
          <button>Salvar</button>
        </>
      )}
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
