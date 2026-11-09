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
  Languages,
  ChevronDown,
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
function formatUidInput(value) {
  const hex = value.replace(/[^0-9a-f]/gi, "").toUpperCase().slice(0, 20);
  return hex.match(/.{1,2}/g)?.join(":") || "";
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
const translationsEs = {
  "Falha na comunicação": "Error de comunicación",
  "Disponível": "Disponible",
  "Em uso": "En uso",
  "Manutenção": "Mantenimiento",
  "Verificar": "Verificar",
  "Em uso pela TI": "En uso por TI",
  "Em uso pela limpeza": "En uso por limpieza",
  "Professor": "Docente",
  "Aluno autorizado": "Estudiante autorizado",
  "Limpeza": "Limpieza",
  "Acesso completo": "Acceso completo",
  "Atividade iniciada": "Actividad iniciada",
  "Atividade encerrada": "Actividad finalizada",
  "Carregando Clack…": "Cargando Clack…",
  "Bem-vindo à portaria.": "Bienvenido a portería.",
  "Entre para acompanhar os ambientes e gerenciar acessos.": "Inicie sesión para consultar los espacios y gestionar los accesos.",
  "Login": "Usuario",
  "Senha": "Contraseña",
  "Entrar": "Ingresar",
  "Uso local · IFSul": "Uso local · IFSul",
  "Ambientes": "Espacios",
  "Cartões": "Tarjetas",
  "Histórico": "Historial",
  "Configurações": "Configuración",
  "Administrador": "Administrador",
  "Portaria": "Portería",
  "Modo ": "Modo ",
  "escuro": "oscuro",
  "claro": "claro",
  "Sair": "Salir",
  "PÁGINA INICIAL": "INICIO",
  "Ambientes do campus": "Espacios del campus",
  "Cartões de acesso": "Tarjetas de acceso",
  "Histórico de atividades": "Historial de actividades",
  "Servidor local": "Servidor local",
  "Fechar": "Cerrar",
  "Planta baixa do IFSul": "Plano del IFSul",
  "Selecione um andar para consultar a planta e suas salas.": "Seleccione un piso para consultar el plano y sus salas.",
  "Andar": "Piso",
  "Térreo": "Planta baja",
  "Andar 1": "Piso 1",
  "Andar 2": "Piso 2",
  "Andar 3": "Piso 3",
  "sala cadastrada": "sala registrada",
  "salas cadastradas": "salas registradas",
  "Nenhuma sala cadastrada neste andar.": "No hay salas registradas en este piso.",
  "Sem responsável": "Sin responsable",
  "Dispositivo conectado": "Dispositivo conectado",
  "Offline / não configurado": "Sin conexión / sin configurar",
  "Manutenção: ": "Mantenimiento: ",
  " · Verificar: ": " · Verificar: ",
  " · Sem conexão recente: ": " · Sin conexión reciente: ",
  "O estado offline não altera a última atividade registrada.": "El estado sin conexión no altera la última actividad registrada.",
  "Legenda de disponibilidade": "Leyenda de disponibilidad",
  "Manutenção / verificar": "Mantenimiento / verificar",
  "Planta baixa": "Plano",
  "Planta do ": "Plano del ",
  "Diminuir zoom": "Alejar",
  "Nível de zoom": "Nivel de zoom",
  "Aumentar zoom": "Acercar",
  "Ajustar": "Ajustar",
  "Abrir imagem": "Abrir imagen",
  "Posicionar salas": "Ubicar salas",
  "Concluir posicionamento": "Finalizar ubicación",
  "Sala para posicionar": "Sala para ubicar",
  " — posição provisória": " — ubicación provisional",
  "Salvando posição…": "Guardando ubicación…",
  "uma sala": "una sala",
  "Clique no centro de ": "Haga clic en el centro de ",
  " na planta para salvar o quadrado. O posicionamento não abre a tranca.": " en el plano para guardar la ubicación. Esto no abre la cerradura.",
  "Para posicionar usando o teclado, abra Configurações → Editar posição e informe X/Y em porcentagem.": "Para ubicar con el teclado, abra Configuración → Editar ubicación e indique X/Y como porcentaje.",
  "Planta ampliável; use a rolagem para explorar": "Plano ampliable; use el desplazamiento para explorar",
  "Clique na planta para posicionar a sala selecionada": "Haga clic en el plano para ubicar la sala seleccionada",
  "Planta baixa do IFSul — ": "Plano del IFSul — ",
  " posição provisória": " ubicación provisional",
  "Passe o mouse ou use Tab nos quadrados para consultar responsável, matrícula e horário. Clique/toque para abrir os detalhes.": "Pase el cursor o use Tab sobre las puertas para consultar responsable, matrícula y horario. Haga clic o toque para abrir los detalles.",
  "salas com posições provisórias": "salas con ubicaciones provisionales",
  "sala com posição provisória": "sala con ubicación provisional",
  " (borda tracejada). Os pontos sugeridos não confirmam a localização real. ": " (borde discontinuo). Los puntos sugeridos no confirman la ubicación real. ",
  "Use Posicionar salas para associar cada cadastro ao centro correto.": "Use Ubicar salas para asociar cada registro con el centro correcto.",
  "Peça ao administrador para confirmar as posições.": "Pida al administrador que confirme las ubicaciones.",
  "Amplie para ver os detalhes e use a rolagem para percorrer a planta. As cores representam atividades registradas, não a posição física da porta.": "Acerque para ver los detalles y desplácese por el plano. Los colores representan actividades registradas, no la posición física de la puerta.",
  "Planta indisponível": "Plano no disponible",
  "A planta deste andar vem aqui": "Aquí se mostrará el plano de este piso",
  "Não foi possível carregar a imagem deste andar.": "No se pudo cargar la imagen de este piso.",
  "Espaço reservado para a imagem da planta baixa do campus.": "Espacio reservado para el plano del campus.",
  "Imagem não carregada": "Imagen no cargada",
  "Aguardando planta baixa": "Esperando el plano",
  "Perfis predefinidos, permissões ajustadas por ambiente.": "Perfiles predefinidos; permisos ajustados por espacio.",
  "Novo cartão": "Nueva tarjeta",
  "Buscar cartão": "Buscar tarjeta",
  "Nome, matrícula ou UID": "Nombre, matrícula o UID",
  "Filtrar por perfil": "Filtrar por perfil",
  "Todos os perfis": "Todos los perfiles",
  "Ordenar por": "Ordenar por",
  "Filtrar cartões por perfil": "Filtrar tarjetas por perfil",
  "Ordenar cartões": "Ordenar tarjetas",
  "Ordem alfabética (A–Z)": "Orden alfabético (A–Z)",
  "Ordem de cadastro": "Orden de registro",
  "Cartões ativos": "Tarjetas activas",
  "Cartões bloqueados continuam aqui enquanto mantêm o UID vinculado.": "Las tarjetas bloqueadas permanecen aquí mientras tengan un UID vinculado.",
  "Nenhum cartão corresponde aos filtros.": "Ninguna tarjeta coincide con los filtros.",
  "Nenhum cartão vinculado.": "No hay tarjetas vinculadas.",
  "Cartões desvinculados": "Tarjetas desvinculadas",
  "O UID foi removido do cadastro; o registro e o histórico foram preservados.": "El UID se quitó del registro; se conservaron el registro y el historial.",
  "Nenhum cartão desvinculado.": "No hay tarjetas desvinculadas.",
  "Tipo de atividade": "Tipo de actividad",
  "Eventos dos dispositivos": "Eventos de dispositivos",
  "Ações da portaria": "Acciones de portería",
  "Filtrar sala": "Filtrar sala",
  "Filtrar por dia": "Filtrar por fecha",
  "Todas as atividades": "Todas las actividades",
  "Atualizar": "Actualizar",
  "Horário do evento": "Hora del evento",
  "Sala": "Sala",
  "Pessoa": "Persona",
  "Resultado": "Resultado",
  "Recebido": "Recibido",
  "Portaria / sistema": "Portería / sistema",
  "Eventos anteriores": "Eventos anteriores",
  "Sem relógio válido no dispositivo, o horário do evento fica desconhecido; a ordem é preservada pela sequência.": "Sin un reloj válido en el dispositivo, se desconoce la hora del evento; el orden se conserva mediante la secuencia.",
  "Nenhuma ação da portaria neste período.": "No hay acciones de portería en este período.",
  "Ambientes e dispositivos": "Espacios y dispositivos",
  "Cadastrar sala": "Registrar sala",
  "Cadastrar dispositivo": "Registrar dispositivo",
  "Editar posição": "Editar ubicación",
  "Trocar token": "Cambiar token",
  "Contas da portaria": "Cuentas de portería",
  "Nova conta": "Nueva cuenta",
  "Bloquear": "Bloquear",
  "Detalhes e cadastro": "Detalles y registro",
  "Último usuário: ": "Último usuario: ",
  "Responsável": "Responsable",
  "Matrícula": "Matrícula",
  "Em uso desde": "En uso desde",
  "Registro recebido": "Registro recibido",
  " (não é o horário de início)": " (no es la hora de inicio)",
  "Sem atividade em andamento.": "No hay actividad en curso.",
  "Sala indisponível para iniciar uma atividade.": "La sala no está disponible para iniciar una actividad.",
  "Dispositivo sem conexão recente. Informação da última sincronização.": "El dispositivo no tiene una conexión reciente. Se muestra la última sincronización.",
  "Verificar estado": "Verificar estado",
  "Horário não informado": "Hora no informada",
  "Abertura pela portaria / sem responsável": "Apertura por portería / sin responsable",
  "Responsável não informado": "Responsable no informado",
  "NDA (pessoa externa)": "NDA (persona externa)",
  "Não informada": "No informada",
  "Horário exato desconhecido": "Hora exacta desconocida",
  "Última conexão:": "Última conexión:",
  "Destrancar": "Destrabar",
  "Encerrar e trancar": "Finalizar y trabar",
  "Trancar para manutenção": "Trabar para mantenimiento",
  "Encerrar manutenção": "Finalizar mantenimiento",
  "Comandos recentes": "Comandos recientes",
  "Comando enviado. Aguardando confirmação da tranca.": "Comando enviado. Esperando confirmación de la cerradura.",
  "Enviando comando…": "Enviando comando…",
  "Aguardando confirmação da tranca…": "Esperando confirmación de la cerradura…",
  "Sem confirmação: comando expirado.": "Sin confirmación: comando vencido.",
  "Sem tranca cadastrada": "Sin cerradura registrada",
  "Aguardando primeiro contato": "Esperando el primer contacto",
  "Tranca online": "Cerradura conectada",
  "Tranca sem comunicação recente": "Cerradura sin comunicación reciente",
  "Último contato:": "Último contacto:",
  "Verifique alimentação, Wi-Fi e acesso ao servidor. A causa da desconexão ainda não foi identificada.": "Verifique alimentación, Wi-Fi y acceso al servidor. Aún no se identificó la causa de la desconexión.",
  "Confirmado pelo dispositivo": "Confirmado por el dispositivo",
  "Expirado": "Vencido",
  "Aguardando confirmação": "Esperando confirmación",
  "Editar cartão": "Editar tarjeta",
  "Cadastrar cartão": "Registrar tarjeta",
  "Nome": "Nombre",
  "Pessoa externa (NDA)": "Persona externa (NDA)",
  "Perfil": "Perfil",
  "Salas permitidas": "Salas permitidas",
  "Salas de aula": "Aulas",
  "Todas": "Todas",
  "Limpar": "Limpiar",
  "Ler outro cartão": "Leer otra tarjeta",
  "Iniciar leitura": "Iniciar lectura",
  "Cancelar leitura": "Cancelar lectura",
  "Cartão lido: ": "Tarjeta leída: ",
  "Ativo": "Activa",
  "Desvinculado": "Desvinculada",
  "Externo · NDA": "Externo · NDA",
  "Situação": "Estado",
  "Cartão": "Tarjeta",
  "Editar": "Editar",
  "Alterar senha": "Cambiar contraseña",
  "Trocar credencial do dispositivo": "Cambiar credencial del dispositivo",
  "Concluir": "Finalizar",
  "Senha atual": "Contraseña actual",
  "Nova senha": "Nueva contraseña",
  "Categoria": "Categoría",
  "Sala de aula": "Aula",
  "Administrativa": "Administrativa",
  "Outra": "Otra",
  "Papel": "Rol",
  "Senha inicial": "Contraseña inicial",
  "Tipo": "Tipo",
  "Tranca": "Cerradura",
  "Cadastrador": "Lector de registro",
  "Sala (apenas tranca)": "Sala (solo para cerraduras)",
  "Selecione": "Seleccione",
  "Salvar": "Guardar",
  "Idioma": "Idioma",
  "Português": "Português",
  "Español": "Español (Uruguay)",
  "Aproxime o cartão (até 2 minutos).": "Acerque la tarjeta (hasta 2 minutos).",
  "Nenhum cartão lido": "No se leyó ninguna tarjeta",
  "Salvar cadastro": "Guardar registro",
  "Salvar e cadastrar outro": "Guardar y registrar otra",
  "Revogar acesso": "Revocar acceso",
  "Desvincular cartão": "Desvincular tarjeta",
  "Desvincular este cartão? O histórico será preservado.": "¿Desvincular esta tarjeta? Se conservará el historial.",
  "Revogar todo o acesso deste cartão? O UID e o histórico serão preservados. As trancas aplicam a alteração ao sincronizar.": "¿Revocar todo el acceso de esta tarjeta? Se conservarán el UID y el historial. Las cerraduras aplicarán el cambio al sincronizar.",
  "Intervenções ficam registradas em seu nome. A confirmação indica execução do comando pelo dispositivo, sem sensor mecânico.": "Las intervenciones quedan registradas a su nombre. La confirmación indica que el dispositivo ejecutó el comando; no hay un sensor mecánico.",
  "A credencial de ": "La credencial de ",
  " será invalidada imediatamente. Você precisará atualizar o token no firmware. A sequência e o histórico serão preservados.": " se invalidará de inmediato. Deberá actualizar el token en el firmware. Se conservarán la secuencia y el historial.",
  "Cartão ativo": "Tarjeta activa",
  "Selecione um cadastrador": "Seleccione un lector de registro",
  "Ler pelo cadastrador": "Leer con el lector de registro",
  "Inserir UID manualmente": "Ingresar UID manualmente",
  "UID da tag": "UID de la tarjeta",
  "Digite os caracteres hexadecimais; os dois-pontos são inseridos automaticamente.": "Escriba los caracteres hexadecimales; los dos puntos se insertan automáticamente.",
  "Leitura na portaria": "Lectura en portería",
  "TI tem acesso a todas as salas, incluindo data center, estoque e novos ambientes. Não é necessário selecionar salas individualmente.": "TI tiene acceso a todas las salas, incluidos el centro de datos, el depósito y los nuevos espacios. No es necesario seleccionar salas individualmente.",
  "Acesso global da TI aplicado pelo servidor.": "El servidor aplica el acceso global de TI.",
  "O perfil não concede salas automaticamente. Confira a seleção acima.": "El perfil no concede acceso automático a las salas. Revise la selección anterior.",
  "Clique no centro da sala na planta para salvar a posição. O posicionamento não abre a tranca.": "Haga clic en el centro de la sala del plano para guardar la ubicación. Esto no abre la cerradura.",
  "Clique no centro da sala na planta. Você pode clicar novamente para ajustar antes de salvar.": "Haga clic en el centro de la sala en el plano. Puede volver a hacer clic para ajustar antes de guardar.",
  "X/Y em porcentagem (0–100). Deixe ambos vazios para posicionar depois.": "X/Y en porcentaje (0–100). Déjelos vacíos para ubicar después.",
  "X na planta (%)": "X en el plano (%)",
  "Y na planta (%)": "Y en el plano (%)",
  "Configurar ambiente": "Configurar espacio",
  "Conta da portaria": "Cuenta de portería",
  "Novo dispositivo": "Nuevo dispositivo",
  "Guarde esta credencial no arquivo local do dispositivo. Ela só aparece nesta resposta.": "Guarde esta credencial en el archivo local del dispositivo. Solo se muestra en esta respuesta.",
  "Ajuste o andar em Configurações.": "Ajuste el piso en Configuración.",
  "Salas com andar ainda não padronizado: ": "Salas sin un piso estandarizado: ",
  " na planta para salvar a posição. O posicionamento não abre a tranca.": " en el plano para guardar la ubicación. Esto no abre la cerradura.",
  "Passe o mouse ou use Tab nas portas para consultar responsável, matrícula e horário. Clique/toque para abrir os detalhes.": "Pase el cursor o use Tab sobre las puertas para consultar responsable, matrícula y horario. Haga clic o toque para abrir los detalles.",
  "Desconhecido": "Desconocido",
  "Bloqueado": "Bloqueada",
  "Todas as salas": "Todas las salas",
  "Liberar acesso": "Habilitar acceso",
  "Permissões": "Permisos",
  "Não": "No",
  "Sim": "Sí",
  "Posição na planta salva.": "Ubicación guardada en el plano.",
  "Alteração salva. Permissões chegam às trancas na próxima sincronização.": "Cambios guardados. Los permisos llegarán a las cerraduras en la próxima sincronización.",
  "Posição definida. Clique em Salvar para gravar o cadastro.": "Ubicación definida. Haga clic en Guardar para registrar.",
  "Nenhuma posição escolhida. Também é possível preencher X/Y pelo teclado.": "No se eligió una ubicación. También puede indicar X/Y con el teclado.",
  " Clique no centro da sala na planta. Você pode clicar novamente para ajustar antes de salvar.": " Haga clic en el centro de la sala en el plano. Puede volver a hacer clic para ajustar antes de guardar.",
  "Planta indisponível. Informe a posição nos campos X/Y abaixo.": "Plano no disponible. Indique la ubicación en los campos X/Y de abajo.",
  "Zoom do cadastro": "Zoom del registro",
  "Diminuir zoom do cadastro": "Alejar el plano del registro",
  "Aumentar zoom do cadastro": "Acercar el plano del registro",
  "Posicionar sala — ": "Ubicar sala — ",
  "Definir posição da sala na planta": "Definir la ubicación de la sala en el plano",
  "Portaria · Admin": "Portería · Administración",
  "Bloquear acesso de ": "¿Bloquear el acceso de ",
  "?": "?",
};
const LanguageContext = React.createContext(null);
function useLanguage() {
  return React.useContext(LanguageContext) || { language: "pt-BR", setLanguage: () => {}, t: (text) => text };
}
function ClackLogo({ large = false }) {
  return <div className={`brand${large ? " brand-login" : ""}`} aria-label="Clack">
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M7 42V8.5A2.5 2.5 0 0 1 9.5 6H25v36" fill="none" stroke="var(--brand-frame)" strokeWidth="3.2" strokeLinejoin="round"/>
      <path d="M14 16l16-4v30H14z" fill="var(--brand-panel)"/>
      <circle cx="25.5" cy="29" r="1.8" fill="var(--brand-signal)"/>
      <path d="m34 13 4-4 2 6zM37 21l6-1v5zM34 29l4 4 2-6z" fill="var(--brand-signal)"/>
    </svg>
    <strong className="brand-name">CLACK</strong>
  </div>;
}
function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const current = language === "es-UY" ? t("Español (Uruguay)") : t("Português");
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = event => {
      if (event.type === "keydown" && event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector(".language-trigger")?.focus();
      }
      if (event.type === "pointerdown" && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);
  const choose = value => {
    setLanguage(value);
    setOpen(false);
    root.current?.querySelector(".language-trigger")?.focus();
  };
  const toggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) requestAnimationFrame(() => root.current?.querySelector('[role="menuitemradio"][aria-checked="true"]')?.focus());
  };
  const moveMenuFocus = event => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = [...root.current.querySelectorAll('[role="menuitemradio"]')];
    const currentIndex = items.indexOf(document.activeElement);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : currentIndex < 0 ? (event.key === "ArrowDown" ? 0 : items.length - 1) : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[nextIndex]?.focus();
  };
  return <div className="language-picker" ref={root}>
    <button
      type="button"
      className="language-trigger"
      aria-label={`${t("Idioma")}: ${current}`}
      aria-haspopup="menu"
      aria-expanded={open}
      data-language={language}
      onClick={toggle}
    >
      <Languages size={16} aria-hidden="true" />
      <span>{current}</span>
      <ChevronDown size={15} aria-hidden="true" />
    </button>
    {open && <div className="language-options" role="menu" aria-label={t("Idioma")} onKeyDown={moveMenuFocus}>
      <button type="button" role="menuitemradio" aria-checked={language === "pt-BR"} className={language === "pt-BR" ? "selected" : ""} onClick={() => choose("pt-BR")}>{t("Português")}</button>
      <button type="button" role="menuitemradio" aria-checked={language === "es-UY"} className={language === "es-UY" ? "selected" : ""} onClick={() => choose("es-UY")}>{t("Español (Uruguay)")}</button>
    </div>}
  </div>;
}
const eventLabels = {
  atividade_iniciada: "Atividade iniciada",
  atividade_encerrada: "Atividade encerrada",
};
const normalizedSearch = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
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
    }),
    [theme, setTheme] = useState(
      localStorage.getItem("clack-theme") || "light",
    ),
    [language, setLanguage] = useState(() => {
      const saved = localStorage.getItem("clack-language");
      if (saved === "pt-BR" || saved === "es-UY") return saved;
      return navigator.language?.toLowerCase().startsWith("es") ? "es-UY" : "pt-BR";
    }),
    [modal, setModal] = useState(null),
    [floor, setFloor] = useState(""),
    [history, setHistory] = useState({ eventos: [], auditoria: [] }),
    [historyView, setHistoryView] = useState("eventos"),
    [historyDay, setHistoryDay] = useState(""),
    [filter, setFilter] = useState(""),
    [cardSearch, setCardSearch] = useState(""),
    [cardProfile, setCardProfile] = useState(""),
    [cardOrder, setCardOrder] = useState("name"),
    [operators, setOperators] = useState([]);
  const t = (text) => language === "es-UY" ? translationsEs[text] || text : text;
  const locale = { language, setLanguage, t };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("clack-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("clack-language", language);
    document.title = language === "es-UY" ? "Clack · Portería" : "Clack · Portaria";
  }, [language]);
  const resetNavigation = () => {
    setTab("salas");
    setModal(null);
    setOperators([]);
    setNotice("");
    setHistory({ eventos: [], auditoria: [] });
    setHistoryView("eventos");
    setHistoryDay("");
    setFilter("");
    setCardSearch("");
    setCardProfile("");
    setCardOrder("name");
  };
  const report = (e) => {
    setError(t(e.message));
    if (e.status === 401) {
      csrf = "";
      resetNavigation();
      setOp(null);
    }
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
    let stopped = false;
    let inFlight = false;
    let pollAgain = false;
    let timer;
    const poll = async () => {
      if (stopped) return;
      if (document.visibilityState !== "visible") {
        timer = setTimeout(poll, 5000);
        return;
      }
      if (inFlight) {
        pollAgain = true;
        return;
      }
      inFlight = true;
      pollAgain = false;
      await refresh();
      inFlight = false;
      if (stopped) return;
      const visible = document.visibilityState === "visible";
      const delay = pollAgain && visible ? 0 : visible ? 1000 : 5000;
      pollAgain = false;
      timer = setTimeout(poll, delay);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      if (inFlight) pollAgain = true;
      else timer = setTimeout(poll, 0);
    };
    poll();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [op]);
  useEffect(() => {
    if (op && tab === "historico")
      api(historyQuery(filter, historyDay))
        .then(setHistory)
        .catch(report);
    if (op?.papel === "admin" && tab === "admin")
      api("operadores")
        .then((d) => setOperators(d.operadores))
        .catch(report);
  }, [tab, op, filter, historyDay]);
  async function save(action, body) {
    setError("");
    try {
      const r = await api(action, body);
      setNotice(
        t(action === "comando" ? "Comando enviado. Aguardando confirmação da tranca." : action === "posicao_sala" ? "Posição na planta salva." : "Alteração salva. Permissões chegam às trancas na próxima sincronização."),
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
  const cardQuery = normalizedSearch(cardSearch);
  const filteredCards = data.cartoes
    .filter((c) => {
      const cardText = normalizedSearch(`${c.nome} ${c.matricula || ""} ${c.uid || ""}`);
      return (!cardQuery || cardText.includes(cardQuery)) &&
        (!cardProfile || c.perfil === cardProfile);
    })
    .sort((a, b) => cardOrder === "registration"
      ? Number(a.id) - Number(b.id)
      : String(a.nome || "").localeCompare(String(b.nome || ""), language, { sensitivity: "base" }) || Number(a.id) - Number(b.id));
  const linkedCards = filteredCards.filter((c) => String(c.uid || "").trim());
  const unlinkedCards = filteredCards.filter((c) => !String(c.uid || "").trim());
  const cardTable = (cards, emptyText) => cards.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>{t("Pessoa")}</th><th>{t("Perfil")}</th><th>{t("Cartão")}</th><th>{t("Situação")}</th><th /></tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.nome}</strong><small>{Number(c.externo) ? t("Externo · NDA") : c.matricula}</small></td>
              <td>{t(labels[c.perfil] || c.perfil)}</td>
              <td>{c.uid || t("Desvinculado")}</td>
              <td>{t(Number(c.ativo) ? "Ativo" : c.uid ? "Bloqueado" : "Desvinculado")}</td>
              <td><button className="quiet" onClick={() => setModal({ kind: "card", value: c })}>{t("Editar")}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : <div className="empty card-empty">{emptyText}</div>;
  if (loading)
    return (
      <LanguageContext.Provider value={locale}>
        <main className="login"><LanguageSwitcher/><p>{t("Carregando Clack…")}</p></main>
      </LanguageContext.Provider>
    );
  if (!op)
    return (
      <LanguageContext.Provider value={locale}>
      <main className="login">
        <LanguageSwitcher />
        <form
          className="login-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const f = new FormData(e.target);
            try {
              const s = await api("login", Object.fromEntries(f));
              csrf = s.csrf;
              resetNavigation();
              setOp(s.operador);
            } catch (e) {
              report(e);
            }
          }}
        >
          <ClackLogo large />
          <h1>{t("Bem-vindo à portaria.")}</h1>
          <p>{t("Entre para acompanhar os ambientes e gerenciar acessos.")}</p>
          <label>
            {t("Login")}
            <input name="login" autoComplete="username" required />
          </label>
          <label>
            {t("Senha")}
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
          <button>{t("Entrar")}</button>
          <small>{t("Uso local · IFSul")}</small>
        </form>
      </main>
      </LanguageContext.Provider>
    );
  return (
    <LanguageContext.Provider value={locale}>
    <div className="shell">
      <aside>
        <ClackLogo />
        <nav>
          {[
            ["salas", Layers, t("Ambientes")],
            ["cartoes", Users, t("Cartões")],
            ["historico", History, t("Histórico")],
            ...(op.papel === "admin"
              ? [["admin", Settings, t("Configurações")]]
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
          <small>{t(op.papel === "admin" ? "Administrador" : "Portaria")}</small>
          <LanguageSwitcher />
          <button
            className="quiet"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}{t("Modo ")}
            {t(theme === "light" ? "escuro" : "claro")}
          </button>
          <button
            className="quiet"
            onClick={() => setModal({ kind: "password" })}
          >
            <KeyRound size={17} aria-hidden="true" />
            {t("Alterar senha")}
          </button>
          <button
            className="quiet"
            onClick={() =>
              api("logout", {})
                .then(() => {
                  csrf = "";
                  resetNavigation();
                  setOp(null);
                })
                .catch(report)
            }
          >
            <LogOut size={17} />
            {t("Sair")}
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">
              CLACK / {tab === "salas" ? t("PÁGINA INICIAL") : t(tab === "cartoes" ? "Cartões" : tab === "historico" ? "Histórico" : "Configurações").toLocaleUpperCase(language)}
            </span>
            <h1>
              {
                {
                  salas: t("Ambientes do campus"),
                  cartoes: t("Cartões de acesso"),
                  historico: t("Histórico de atividades"),
                  admin: t("Configurações"),
                }[tab]
              }
            </h1>
          </div>
          <div className="header-actions">
            <span className="local">
              <i />{t("Servidor local")}
            </span>
          </div>
        </header>
        {error && (
          <div role="alert" className="error">
            {error}
            <button className="quiet" onClick={() => setError("")}>
              {t("Fechar")}
            </button>
          </div>
        )}
        {notice && (
          <div role="status" className="notice">
            {notice}
            <button className="quiet" onClick={() => setNotice("")}>
              {t("Fechar")}
            </button>
          </div>
        )}
        {tab === "salas" && (
          <>
            <div className="stats">
              {ROOM_STATUSES.map((status) => (
                <section className={`status-metric status-metric-${status.key}`} key={status.key}>
                  <span className={"dot occupancy-" + status.key} />
              <span>{t(status.label)}</span>
                  <strong>
                    {data.salas.filter((s) => roomStatus(s).key === status.key).length}
                  </strong>
                </section>
              ))}
            </div>
            <p className="muted campus-alerts">
              {t("Manutenção: ")}{data.salas.filter(s => s.estado === "manutencao").length}{t(" · Verificar: ")}{data.salas.filter(s => s.estado === "erro").length}{t(" · Sem conexão recente: ")}{data.salas.filter(s => !Number(s.online)).length}. {t("O estado offline não altera a última atividade registrada.")}
            </p>
            <section className="panel">
              <div className="toolbar">
                <div>
                  <h2>{t("Planta baixa do IFSul")}</h2>
                  <p>{t("Selecione um andar para consultar a planta e suas salas.")}</p>
                </div>
                <select
                  aria-label={t("Andar")}
                  value={currentFloor}
                  onChange={(e) => setFloor(e.target.value)}
                >
                  {FLOORS.map((f) => <option key={f} value={f}>{t(f)}</option>)}
                </select>
              </div>
              <FloorPlan key={currentFloor} floor={currentFloor} rooms={rooms}
                canEdit={op.papel === "admin"} save={save}
                onSelect={room => setModal({ kind: "room", value: room })} />
              <div className="floor-caption">
                <strong>{t(currentFloor)}</strong>
                <span>{rooms.length} {t(rooms.length === 1 ? "sala cadastrada" : "salas cadastradas")}</span>
              </div>
            </section>
            {!rooms.length && <p className="muted">{t("Nenhuma sala cadastrada neste andar.")}</p>}
            <div className="room-grid">
              {rooms.map((s) => (
                <button
                  className="room-card"
                  key={s.id}
                  onClick={() => setModal({ kind: "room", value: s })}
                >
                  <span className={"badge occupancy-" + roomStatus(s).key}>
                    {t(roomStatus(s).label)}
                  </span>
                  <h3>{s.nome}</h3>
                  <p>
                    {t(s.andar)} · {s.responsavel_nome || t("Sem responsável")}
                  </p>
                  <small>
                    {Number(s.online)
                      ? t("Dispositivo conectado")
                      : t("Offline / não configurado")}
                  </small>
                </button>
              ))}
            </div>
            {unmappedRooms.length > 0 && <p className="notice">
              {t("Salas com andar ainda não padronizado: ")}{unmappedRooms.map(s => `${s.nome} (${t(s.andar)})`).join(", ")}. {t("Ajuste o andar em Configurações.")}
            </p>}
          </>
        )}
        {tab === "cartoes" && (
          <section className="panel">
            <div className="toolbar card-toolbar-main">
              <p>{t("Perfis predefinidos, permissões ajustadas por ambiente.")}</p>
              <button onClick={() => setModal({ kind: "card", value: null })}>
                <Plus size={17} />
                {t("Novo cartão")}
              </button>
            </div>
            <div className="card-filters">
              <label>
                {t("Buscar cartão")}
                <input
                  type="search"
                  aria-label={t("Buscar cartão")}
                  placeholder={t("Nome, matrícula ou UID")}
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                />
              </label>
              <label>
                {t("Filtrar por perfil")}
                <select aria-label={t("Filtrar cartões por perfil")} value={cardProfile} onChange={(e) => setCardProfile(e.target.value)}>
                  <option value="">{t("Todos os perfis")}</option>
                  {Object.entries(labels).filter(([key]) => ["professor", "aluno", "limpeza", "ti", "completo"].includes(key)).map(([key, label]) => (
                    <option key={key} value={key}>{t(label)}</option>
                  ))}
                </select>
              </label>
              <label>
                {t("Ordenar por")}
                <select aria-label={t("Ordenar cartões")} value={cardOrder} onChange={(e) => setCardOrder(e.target.value)}>
                  <option value="name">{t("Ordem alfabética (A–Z)")}</option>
                  <option value="registration">{t("Ordem de cadastro")}</option>
                </select>
              </label>
            </div>

            <section className="card-list-block" aria-labelledby="linked-cards-title">
              <div className="card-list-heading">
                <div>
                  <div className="card-list-title">
                    <h2 id="linked-cards-title">{t("Cartões ativos")}</h2>
                    <span className="card-count">{linkedCards.length}</span>
                  </div>
                  <small>{t("Cartões bloqueados continuam aqui enquanto mantêm o UID vinculado.")}</small>
                </div>
              </div>
              {cardTable(linkedCards, t(data.cartoes.length && (cardSearch || cardProfile) ? "Nenhum cartão corresponde aos filtros." : "Nenhum cartão vinculado."))}
            </section>

            <section className="card-list-block" aria-labelledby="unlinked-cards-title">
              <div className="card-list-heading">
                <div>
                  <div className="card-list-title">
                    <h2 id="unlinked-cards-title">{t("Cartões desvinculados")}</h2>
                    <span className="card-count">{unlinkedCards.length}</span>
                  </div>
                  <small>{t("O UID foi removido do cadastro; o registro e o histórico foram preservados.")}</small>
                </div>
              </div>
              {cardTable(unlinkedCards, t(data.cartoes.length && (cardSearch || cardProfile) ? "Nenhum cartão corresponde aos filtros." : "Nenhum cartão desvinculado."))}
            </section>
          </section>
        )}
        {tab === "historico" && (
          <section className="panel">
            <div className="history-tabs" role="tablist" aria-label={t("Tipo de atividade")}>
              <button
                className={`history-tab${historyView === "eventos" ? " active" : ""}`}
                role="tab"
                aria-selected={historyView === "eventos"}
                aria-controls="history-events-panel"
                onClick={() => setHistoryView("eventos")}
              >
                {t("Eventos dos dispositivos")}
              </button>
              <button
                className={`history-tab${historyView === "portaria" ? " active" : ""}`}
                role="tab"
                aria-selected={historyView === "portaria"}
                aria-controls="history-portaria-panel"
                onClick={() => setHistoryView("portaria")}
              >
                {t("Ações da portaria")}
              </button>
            </div>
            <div className="toolbar history-toolbar">
              {historyView === "eventos" ? (
                <select
                  aria-label={t("Filtrar sala")}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">{t("Todas as salas")}</option>
                  {data.salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              ) : null}
              <label className="history-day-filter">
                {t("Filtrar por dia")}
                <input
                  type="date"
                  aria-label={t("Filtrar por dia")}
                  value={historyDay}
                  onChange={(e) => setHistoryDay(e.target.value)}
                />
              </label>
              {historyDay && (
                <button className="quiet" onClick={() => setHistoryDay("")}>
                  {t("Todas as atividades")}
                </button>
              )}
              <button
                className="quiet"
                onClick={() =>
                  api(historyQuery(filter, historyDay))
                    .then(setHistory)
                    .catch(report)
                }
              >
                {t("Atualizar")}
              </button>
            </div>
            {historyView === "eventos" ? (
              <div id="history-events-panel" role="tabpanel" aria-label={t("Eventos dos dispositivos")}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Horário do evento")}</th>
                        <th>{t("Sala")}</th>
                        <th>{t("Pessoa")}</th>
                        <th>{t("Resultado")}</th>
                        <th>{t("Recebido")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.eventos.map((e) => (
                        <tr key={e.id}>
                          <td>{date(e.ocorrido_em, language)}</td>
                          <td>{e.sala}</td>
                          <td>{e.nome || t("Portaria / sistema")}</td>
                          <td>{t(eventLabels[e.resultado] || e.resultado)}</td>
                          <td>{date(e.recebido_em, language)}</td>
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
                        historyQuery(filter, historyDay, history.eventos.at(-1).id),
                      )
                        .then(setHistory)
                        .catch(report)
                    }
                  >
                    {t("Eventos anteriores")}
                  </button>
                )}
                <p className="muted">
                  {t("Sem relógio válido no dispositivo, o horário do evento fica desconhecido; a ordem é preservada pela sequência.")}
                </p>
              </div>
            ) : (
              <div id="history-portaria-panel" role="tabpanel" aria-label={t("Ações da portaria")}>
                {history.auditoria.length ? history.auditoria.map((a) => (
                  <div className="audit" key={a.id}>
                    <strong>{a.operador}</strong>
                    <span>{t(a.acao.replaceAll("_", " "))}</span>
                    <small>{date(a.criado_em, language)}</small>
                  </div>
                )) : <div className="empty">{t("Nenhuma ação da portaria neste período.")}</div>}
              </div>
            )}
          </section>
        )}
        {tab === "admin" && op.papel === "admin" && (
          <>
            <section className="panel">
              <div className="toolbar">
                <h2>{t("Ambientes e dispositivos")}</h2>
                <div className="actions">
                  <button
                    onClick={() =>
                      setModal({ kind: "environment", value: null })
                    }
                  >
                    {t("Cadastrar sala")}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setModal({ kind: "device" })}
                  >
                    {t("Cadastrar dispositivo")}
                  </button>
                </div>
              </div>
              {data.salas.map((s) => (
                <div className="audit" key={s.id}>
                  <strong>{s.nome}</strong>
                  <span>
                    {t(s.andar)} · {t(s.categoria)}
                  </span>
                  <button
                    className="quiet"
                    onClick={() => setModal({ kind: "environment", value: s })}
                  >
                    {t("Editar posição")}
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
                  <small>{date(d.ultima_conexao, language)}</small>
                  <button
                    className="quiet"
                    onClick={() => setModal({ kind: "rotate", value: d })}
                  >
                    {t("Trocar token")}
                  </button>
                </div>
              ))}
            </section>
            <section className="panel">
              <div className="toolbar">
                <h2>{t("Contas da portaria")}</h2>
                <button onClick={() => setModal({ kind: "operator" })}>
                  {t("Nova conta")}
                </button>
              </div>
              {operators.map((o) => (
                <div className="audit" key={o.id}>
                  <strong>{o.nome}</strong>
                  <span>
                    {t(o.papel)} · {t(Number(o.ativo) ? "Ativo" : "Bloqueado")}
                  </span>
                  {o.id !== op.id && Number(o.ativo) > 0 && (
                    <button
                      className="quiet"
                      onClick={() => {
                        if (confirm(t("Bloquear acesso de ") + o.nome + t("?")))
                          save("bloquear_operador", { id: o.id })
                            .then(() => api("operadores"))
                            .then((d) => setOperators(d.operadores))
                            .catch(() => {});
                      }}
                    >
                      {t("Bloquear")}
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
            aria-label={t("Detalhes e cadastro")}
          >
            <button
              className="close quiet"
              aria-label={t("Fechar")}
              onClick={() => setModal(null)}
            >
              ×
            </button>
            {modal.kind === "room" ? (
              <Room
                room={
                  data.salas.find((s) => s.id === modal.value.id) || modal.value
                }
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
    </LanguageContext.Provider>
  );
}
function ConnectionDetails({ room }) {
  const { t, language } = useLanguage();
  const label = !room.dispositivo_id ? "Sem tranca cadastrada" : !room.ultima_conexao ? "Aguardando primeiro contato" : Number(room.online) ? "Tranca online" : "Tranca sem comunicação recente";
  const seconds = Math.max(0, Number(room.contato_segundos) || 0);
  const elapsed = seconds < 60 ? `${seconds} s` : seconds < 3600 ? `${Math.floor(seconds / 60)} min` : `${Math.floor(seconds / 3600)} h`;
  return <div className="connection-details">
    <strong>{t(label)}</strong>
    {room.ultima_conexao && <p>{t("Último contato:")} {date(room.ultima_conexao, language)} · {elapsed}</p>}
    {room.dispositivo_id && !Number(room.online) && <p>{t("Verifique alimentação, Wi-Fi e acesso ao servidor. A causa da desconexão ainda não foi identificada.")}</p>}
  </div>;
}
function OccupancyDetails({ room }) {
  const { language, t } = useLanguage();
  const status = roomStatus(room);
  const usage = roomUsage(room, language);
  return <div className="occupancy-details">
    <span className={`badge occupancy-${status.key}`}>{t(status.label)}</span>
    {usage ? <dl>
      <div><dt>{t("Responsável")}</dt><dd>{t(usage.name)}</dd></div>
      <div><dt>{t("Matrícula")}</dt><dd>{t(usage.enrollment)}</dd></div>
      <div><dt>{t("Em uso desde")}</dt><dd>{usage.since}</dd></div>
      {usage.received && <div><dt>{t("Registro recebido")}</dt><dd>{usage.received}{t(" (não é o horário de início)")}</dd></div>}
    </dl> : <>
      {room.estado === "disponivel" && room.ultimo_usuario_nome && <p className="last-room-user">{t("Último usuário: ")}{room.ultimo_usuario_nome}</p>}
      <p>{t(room.estado === "disponivel" ? "Sem atividade em andamento." : "Sala indisponível para iniciar uma atividade.")}</p>
    </>}
    <ConnectionDetails room={room} />
  </div>;
}
function FloorPlan({ floor, rooms = [], canEdit = false, save, onSelect }) {
  const { t } = useLanguage();
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
  if (src && !failed) return <div className="floor-viewer" aria-label={`${t("Planta baixa")} — ${t(floor)}`}>
    <div className="floor-legend" aria-label={t("Legenda de disponibilidade")}>
      {ROOM_STATUSES.map(status => <span key={status.key}><i className={`legend-door occupancy-${status.key}`} aria-hidden="true"><DoorOpen size={17} strokeWidth={2.4}/></i>{t(status.label)}</span>)}
      <span><i className="legend-door occupancy-maintenance" aria-hidden="true"><DoorOpen size={17} strokeWidth={2.4}/></i>{t("Manutenção / verificar")}</span>
    </div>
    <div className="floor-tools">
      <span>{t("Planta do ")}{t(floor).toLocaleLowerCase("es-UY")}</span>
      <div className="actions">
        <button type="button" className="quiet" aria-label={t("Diminuir zoom")} disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1,z-.5))}><ZoomOut size={18}/></button>
        <output aria-live="polite" aria-label={t("Nível de zoom")}>{Math.round(zoom*100)}%</output>
        <button type="button" className="quiet" aria-label={t("Aumentar zoom")} disabled={zoom >= 3} onClick={() => setZoom(z => Math.min(3,z+.5))}><ZoomIn size={18}/></button>
        <button type="button" className="quiet" onClick={() => setZoom(1)}><Maximize2 size={16}/>{t("Ajustar")}</button>
        <a className="floor-original" href={src} target="_blank" rel="noopener noreferrer">{t("Abrir imagem")}</a>
        {canEdit && <button type="button" className="secondary" disabled={!rooms.length}
          aria-pressed={editing} onClick={() => {
            setEditing(value => !value); setPeek(null);
            if (!placing) setPlacing(String(unpositioned[0]?.id || rooms[0]?.id || ""));
          }}>{t(editing ? "Concluir posicionamento" : "Posicionar salas")}</button>}
      </div>
    </div>
    {editing && <div className="map-editor">
      <label>{t("Sala para posicionar")}
        <select aria-label={t("Sala para posicionar")} value={placing} disabled={savingPosition} onChange={event => setPlacing(event.target.value)}>
          {rooms.map(room => <option key={room.id} value={room.id}>{room.nome}{!hasMapPosition(room) ? t(" — posição provisória") : ""}</option>)}
        </select>
      </label>
      <p role="status">{savingPosition ? t("Salvando posição…") : `${t("Clique no centro de ")}${placementRoom?.nome || t("uma sala")}${t(" na planta para salvar a posição. O posicionamento não abre a tranca.")}`}</p>
      <small>{t("Para posicionar usando o teclado, abra Configurações → Editar posição e informe X/Y em porcentagem.")}</small>
    </div>}
    <div ref={viewport} className="floor-viewport" tabIndex="0" aria-label={t("Planta ampliável; use a rolagem para explorar")} onWheel={() => setPeek(null)}>
      <div className="floor-image-stage" style={{width: fitWidth ? `${fitWidth * zoom}px` : `${zoom*100}%`, aspectRatio: imageRatio, "--plan-ratio": imageRatio}}>
        <img className={`floor-plan-image${portrait ? " portrait" : ""}`} src={src} alt={`${t("Planta baixa do IFSul")} — ${t(floor)}`}
          onLoad={event => {
            const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
            setPortrait(height > width);
            setImageRatio(Math.max(width, height) / Math.min(width, height));
          }} onError={() => setFailed(true)} />
        {editing && <button type="button" className="map-placement-surface" tabIndex={-1} disabled={savingPosition || !placementRoom}
          aria-label={t("Clique na planta para posicionar a sala selecionada")} onClick={place} />}
        {ordered.map((room, index) => {
          const position = markerPosition(room, index, floor);
          const status = roomStatus(room);
          return <button key={room.id} type="button"
            className={`room-marker occupancy-${status.key}${position.provisional ? " provisional" : ""}${editing && placing === String(room.id) ? " placing" : ""}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            data-room-id={room.id} data-provisional={position.provisional}
            aria-label={`${room.nome} — ${t(status.label)}${position.provisional ? t(" — posição provisória") : ""}`}
            aria-describedby={shownRoom?.id === room.id ? `room-preview-${floor.replace(" ", "-")}` : undefined}
            onMouseEnter={event => reveal(room, event)} onMouseLeave={() => setPeek(null)}
            onFocus={event => reveal(room, event)} onBlur={() => setPeek(null)}
            onKeyDown={event => { if (event.key === "Escape") setPeek(null); }}
            onClick={() => { setPeek(null); if (editing) setPlacing(String(room.id)); else onSelect?.(room); }}>
            <DoorOpen className="door-marker-icon" size={25} strokeWidth={2.5} aria-hidden="true" />
            {(status.key === "maintenance" || status.key === "unknown") && <span className="door-marker-warning" aria-hidden="true">!</span>}
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
        <p>{t("Passe o mouse ou use Tab nas portas para consultar responsável, matrícula e horário. Clique/toque para abrir os detalhes.")}</p>}
    </div>
    {unpositioned.length > 0 && <p className="map-position-warning">
      {unpositioned.length} {t(unpositioned.length === 1 ? "sala com posição provisória" : "salas com posições provisórias")}{t(" (borda tracejada). Os pontos sugeridos não confirmam a localização real. ")}
      {t(canEdit ? "Use Posicionar salas para associar cada cadastro ao centro correto." : "Peça ao administrador para confirmar as posições.")}
    </p>}
    <p className="muted floor-hint">{t("Amplie para ver os detalhes e use a rolagem para percorrer a planta. As cores representam atividades registradas, não a posição física da porta.")}</p>
  </div>;
  return <div className="floor-plan" aria-label={`${t("Planta baixa")} — ${t(floor)}`}>
    <div className="floor-placeholder">
      <div className="floor-placeholder-icon"><ImageIcon size={32} aria-hidden="true" /></div>
      <span className="eyebrow">IFSUL · {t(floor).toLocaleUpperCase("es-UY")}</span>
      <h3>{t(failed ? "Planta indisponível" : "A planta deste andar vem aqui")}</h3>
      <p>{t(failed ? "Não foi possível carregar a imagem deste andar." : "Espaço reservado para a imagem da planta baixa do campus.")}</p>
      <span className="floor-pending">{t(failed ? "Imagem não carregada" : "Aguardando planta baixa")}</span>
    </div>
  </div>;
}
function date(s, language = "pt-BR") {
  return s
    ? new Date(s.replace(" ", "T") + "Z").toLocaleString(language, { timeZone: "America/Montevideo" })
    : language === "es-UY" ? "Desconocido" : "Desconhecido";
}
function historyQuery(room, day, before) {
  const params = new URLSearchParams();
  if (room) params.set("sala", room);
  if (before) params.set("antes", before);
  if (day) {
    const [year, month, dateOfMonth] = day.split("-").map(Number);
    const start = new Date(year, month - 1, dateOfMonth);
    const end = new Date(year, month - 1, dateOfMonth + 1);
    const sqlUtc = (value) => value.toISOString().slice(0, 19).replace("T", " ");
    params.set("inicio", sqlUtc(start));
    params.set("fim", sqlUtc(end));
  }
  const query = params.toString();
  return `historico${query ? `&${query}` : ""}`;
}
function Room({ room: s, save }) {
  const { language, t } = useLanguage();
  const [sending, setSending] = useState(false);
  const pending = s.comando_status === "pendente";
  const commandText = sending ? "Enviando comando…" : pending ? "Aguardando confirmação da tranca…" : s.comando_status === "confirmado" ? "Confirmado pelo dispositivo" : s.comando_status === "expirado" ? "Sem confirmação: comando expirado." : "";
  const sendCommand = async (command) => {
    if (sending || pending) return;
    setSending(true);
    try { await save("comando", { sala: s.id, comando: command }); }
    catch { /* save presents the API error. */ }
    finally { setSending(false); }
  };
  const maintenanceActive = s.estado === "manutencao";
  const maintenanceCommand = maintenanceActive ? "liberar" : "manutencao";
  const maintenanceLabel = maintenanceActive ? "Encerrar manutenção" : "Trancar para manutenção";
  return (
    <>
      <h2 className="room-floor-title">{t(s.andar)}</h2>
      <p className="room-environment-name">{s.nome}</p>
      <OccupancyDetails room={s} />

      <p>{t("Intervenções ficam registradas em seu nome. A confirmação indica execução do comando pelo dispositivo, sem sensor mecânico.")}</p>
      {commandText && <p role="status" aria-live="polite">
        <strong>{t(commandText)}</strong>
        {!sending && s.comando_acao && <> · {t(({abrir:"Destrancar",fechar:"Encerrar e trancar",manutencao:"Trancar para manutenção",liberar:"Encerrar manutenção"})[s.comando_acao])}</>}
        {!sending && s.comando_status === "confirmado" && s.comando_segundos != null && <> · {Number(s.comando_segundos)} s</>}
      </p>}
      <div className="actions">
        {[
          ["abrir", "Destrancar"],
          ["fechar", "Encerrar e trancar"],
        ].map(([cmd, label]) => (
          <button
            key={cmd}
            disabled={!Number(s.online) || sending || pending}
            onClick={() => {
              if (confirm(t(label) + " " + s.nome + "?"))
                sendCommand(cmd);
            }}
          >
            {t(label)}
          </button>
        ))}
        <button
          className={`room-maintenance-action${maintenanceActive ? " is-maintenance-active" : ""}`}
          disabled={!Number(s.online) || sending || pending}
          onClick={() => {
            if (confirm(t(maintenanceLabel) + " " + s.nome + "?"))
              sendCommand(maintenanceCommand);
          }}
        >
          {t(maintenanceLabel)}
        </button>
      </div>
    </>
  );
}
function Card({ value, data, save, report, close }) {
  const { t } = useLanguage();
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
    [uid, setUid] = useState(""),
    [entryMode, setEntryMode] = useState("reader"),
    [manualUid, setManualUid] = useState(value?.uid || "");
  const [busy, setBusy] = useState(false);
  const captureRef = useRef("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (captureRef.current) api("cancelar_captura", { captura: captureRef.current }).catch(() => {});
    };
  }, []);
  const clearCapture = () => {
    captureRef.current = "";
    setCapture("");
    setUid("");
  };
  const cancelReading = async () => {
    if (captureRef.current) await api("cancelar_captura", { captura: captureRef.current });
    clearCapture();
  };
  const beginReading = async () => {
    setBusy(true);
    try {
      await cancelReading();
      const d = await api("capturar", { dispositivo: reader });
      if (!mounted.current) {
        await api("cancelar_captura", { captura: d.captura });
        return;
      }
      captureRef.current = d.captura;
      setCapture(d.captura);
    } finally { if (mounted.current) setBusy(false); }
  };
  useEffect(() => {
    if (!capture || uid) return;
    let active = true;
    const t = setInterval(() => {
      api("ler_captura", { captura: capture })
        .then((d) => { if (active) setUid(d.uid || ""); })
        .catch((e) => {
          if (active) { report(e); clearCapture(); }
        });
    }, 1000);
    return () => { active = false; clearInterval(t); };
  }, [capture, uid]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const next = e.nativeEvent.submitter?.value === "next";
        setBusy(true);
        try {
          const cardData = entryMode === "manual"
            ? { ...form, uid: manualUid }
            : { ...form, ...(capture ? { captura: capture } : {}) };
          await save("cartao", cardData);
          clearCapture();
          if (next) {
            setForm((f) => ({ ...f, nome: "", matricula: "", ativo: true }));
            if (entryMode === "manual") setManualUid("");
            else await beginReading();
          } else close();
        } catch (e) { report(e); }
        finally { if (mounted.current) setBusy(false); }
      }}
    >
      <h2>{t(value ? "Editar cartão" : "Cadastrar cartão")}</h2>
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
        {t("Pessoa externa (NDA)")}
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
          aria-label={t("Perfil")}
          value={form.perfil}
          onChange={(e) => set("perfil", e.target.value)}
        >
          {["professor", "aluno", "limpeza", "ti", "completo"].map((p) => (
            <option key={p} value={p}>
              {t(labels[p])}
            </option>
          ))}
        </select>
      </label>
      <h3>{t("Salas permitidas")}</h3>
      {form.perfil === "ti" && <p className="notice">{t("TI tem acesso a todas as salas, incluindo data center, estoque e novos ambientes. Não é necessário selecionar salas individualmente.")}</p>}
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
          {t("Salas de aula")}
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
          {t("Todas")}
        </button>
        <button
          type="button"
          className="quiet"
          disabled={form.perfil === "ti"}
          onClick={() => set("salas", [])}
        >
          {t("Limpar")}
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
            {s.nome} · {t(s.andar)}
          </label>
        ))}
      </div>
      <small>
        {t(form.perfil === "ti" ? "Acesso global da TI aplicado pelo servidor." : "O perfil não concede salas automaticamente. Confira a seleção acima.")}
      </small>
      <label className="check">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => set("ativo", e.target.checked)}
        />
        {t("Cartão ativo")}
      </label>
      <fieldset>
        <legend>{t("Leitura na portaria")}</legend>
        <div className="card-entry-tabs" role="tablist" aria-label={t("Leitura na portaria")}>
          <button type="button" role="tab" aria-selected={entryMode === "reader"} aria-controls="card-reader-panel" className={entryMode === "reader" ? "selected" : ""} disabled={busy || !!capture} onClick={() => setEntryMode("reader")}>
            {t("Ler pelo cadastrador")}
          </button>
          <button type="button" role="tab" aria-selected={entryMode === "manual"} aria-controls="card-manual-panel" className={entryMode === "manual" ? "selected" : ""} disabled={busy || !!capture} onClick={() => setEntryMode("manual")}>
            {t("Inserir UID manualmente")}
          </button>
        </div>
        <div id="card-reader-panel" className="card-entry-panel" role="tabpanel" hidden={entryMode !== "reader"}>
          <select aria-label={t("Cadastrador")} disabled={busy || !!capture} value={reader} onChange={(e) => setReader(Number(e.target.value))}>
            <option value="">{t("Selecione um cadastrador")}</option>
            {data.dispositivos.filter((d) => d.tipo === "cadastrador").map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
          <button type="button" className="secondary" disabled={!reader || busy || (!!capture && !uid)} onClick={() => beginReading().catch(report)}>
            {t(uid ? "Ler outro cartão" : "Iniciar leitura")}
          </button>
          {capture && <button type="button" className="quiet" disabled={busy} onClick={() => cancelReading().catch(report)}>{t("Cancelar leitura")}</button>}
          <p>
            {uid ? t("Cartão lido: ") + uid : capture ? t("Aproxime o cartão (até 2 minutos).") : value?.uid || t("Nenhum cartão lido")}
          </p>
        </div>
        <div id="card-manual-panel" className="card-entry-panel" role="tabpanel" hidden={entryMode !== "manual"}>
          <label>
            {t("UID da tag")}
            <input
              aria-label={t("UID da tag")}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={29}
              required={!value && entryMode === "manual"}
              pattern={entryMode === "manual" ? "(?:[0-9A-F]{2}:){3}[0-9A-F]{2}|(?:[0-9A-F]{2}:){6}[0-9A-F]{2}|(?:[0-9A-F]{2}:){9}[0-9A-F]{2}" : undefined}
              placeholder="39:66:4C:A3"
              value={manualUid}
              onChange={(e) => setManualUid(formatUidInput(e.target.value))}
            />
          </label>
          <small className="card-uid-hint">{t("Digite os caracteres hexadecimais; os dois-pontos são inseridos automaticamente.")}</small>
        </div>
      </fieldset>
      <div className="actions">
        <button disabled={busy || (!!capture && !uid)}>{t("Salvar cadastro")}</button>
        {!value && <button value="next" disabled={busy || (entryMode === "reader" ? (!reader || !uid) : !/^(?:[0-9A-F]{2}:){3}[0-9A-F]{2}$|^(?:[0-9A-F]{2}:){6}[0-9A-F]{2}$|^(?:[0-9A-F]{2}:){9}[0-9A-F]{2}$/i.test(manualUid))}>{t("Salvar e cadastrar outro")}</button>}
        {value && Number(value.ativo) === 1 && (
          <button type="button" className="danger" disabled={busy} onClick={() => {
            if (confirm(t("Revogar todo o acesso deste cartão? O UID e o histórico serão preservados. As trancas aplicam a alteração ao sincronizar.")))
              save("revogar_cartao", { id: value.id }).then(close).catch(() => {});
          }}>{t("Revogar acesso")}</button>
        )}
        {value && (
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (
                confirm(t("Desvincular este cartão? O histórico será preservado."))
              )
                save("resetar_cartao", { id: value.id })
                  .then(close)
                  .catch(() => {});
            }}
          >
            {t("Desvincular cartão")}
          </button>
        )}
      </div>
    </form>
  );
}
function RoomPositionPicker({ floor, position, onPosition }) {
  const { t } = useLanguage();
  const [ratio, setRatio] = useState(1491 / 1055);
  const [portrait, setPortrait] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const src = floorImage(floor);
  if (!src || failed) return <p className="muted">{t("Planta indisponível. Informe a posição nos campos X/Y abaixo.")}</p>;
  const positioned = position.mapa_x !== "" && position.mapa_y !== "";
  return <div className="draft-room-position">
    <p>{t("Clique no centro da sala na planta. Você pode clicar novamente para ajustar antes de salvar.")}</p>
    <div className="floor-tools">
      <span>{floor}</span>
      <div className="actions">
        <button type="button" className="quiet" aria-label={t("Diminuir zoom do cadastro")} disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .5))}><ZoomOut size={18}/></button>
        <output aria-label={t("Zoom do cadastro")}>{Math.round(zoom * 100)}%</output>
        <button type="button" className="quiet" aria-label={t("Aumentar zoom do cadastro")} disabled={zoom >= 3} onClick={() => setZoom(z => Math.min(3, z + .5))}><ZoomIn size={18}/></button>
      </div>
    </div>
    <div className="floor-viewport">
      <div className="floor-image-stage" style={{ width: `${zoom * 100}%`, aspectRatio: ratio, "--plan-ratio": ratio }}>
        <img className={`floor-plan-image${portrait ? " portrait" : ""}`} src={src} alt={`${t("Posicionar sala — ")}${t(floor)}`} onError={() => setFailed(true)} onLoad={event => {
          const { naturalWidth: w, naturalHeight: h } = event.currentTarget;
          setPortrait(h > w); setRatio(Math.max(w, h) / Math.min(w, h));
        }}/>
        <button type="button" className="map-placement-surface" tabIndex={-1} aria-label={t("Definir posição da sala na planta")} onClick={event => {
          const next = relativePosition(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
          if (next) onPosition(next);
        }}/>
        {positioned && <span className="draft-room-marker" style={{ left: `${position.mapa_x}%`, top: `${position.mapa_y}%` }} aria-hidden="true"><DoorOpen size={20} strokeWidth={2.5}/></span>}
      </div>
    </div>
    <p role="status">{t(positioned ? "Posição definida. Clique em Salvar para gravar o cadastro." : "Nenhuma posição escolhida. Também é possível preencher X/Y pelo teclado.")}</p>
  </div>;
}
function Setup({ kind, value, data, save, close }) {
  const { t } = useLanguage();
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
            environment: t("Configurar ambiente"),
            operator: t("Conta da portaria"),
            device: t("Novo dispositivo"),
            password: t("Alterar senha"),
            rotate: t("Trocar credencial do dispositivo"),
          }[kind]
        }
      </h2>
      {result ? (
        <>
          <p>
            {t("Guarde esta credencial no arquivo local do dispositivo. Ela só aparece nesta resposta.")}
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
            {t("Concluir")}
          </button>
        </>
      ) : (
        <>
          {!["password", "rotate"].includes(kind) && (
            <label>
              {t("Nome")}
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
                {t("Senha atual")}
                <input
                  type="password"
                  name="atual"
                  required
                  autoComplete="current-password"
                />
              </label>
              <label>
                {t("Nova senha")}
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
              {t("A credencial de ")}{value.nome}{t(" será invalidada imediatamente. Você precisará atualizar o token no firmware. A sequência e o histórico serão preservados.")}
            </p>
          )}
          {kind === "environment" && (
            <>
              <label>
                {t("Andar")}
                <select name="andar" required value={setupFloor} onChange={event => {
                  setSetupFloor(event.target.value);
                  setSetupPosition({ mapa_x: "", mapa_y: "" });
                }}>
                  {value?.andar && !normalizeFloor(value.andar) && <option value={value.andar}>{value.andar} (atual)</option>}
                  {FLOORS.map(f => <option key={f}>{f}</option>)}
                </select>
              </label>
              <label>
                {t("Categoria")}
                <select
                  name="categoria"
                  defaultValue={value?.categoria || "aula"}
                >
                  <option value="aula">{t("Sala de aula")}</option>
                  <option value="administrativa">{t("Administrativa")}</option>
                  <option value="outra">{t("Outra")}</option>
                </select>
              </label>
              <RoomPositionPicker key={setupFloor} floor={setupFloor} position={setupPosition} onPosition={setSetupPosition}/>
              <p className="muted">{t("X/Y em porcentagem (0–100). Deixe ambos vazios para posicionar depois.")}</p>
              <div className="actions">
                <label>
                  {t("X na planta (%)")}
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
                  {t("Y na planta (%)")}
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
                {t("Senha inicial")}
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
                {t("Papel")}
                <select name="papel">
                  <option value="portaria">{t("Portaria")}</option>
                  <option value="admin">{t("Administrador")}</option>
                </select>
              </label>
            </>
          )}
          {kind === "device" && (
            <>
              <label>
                {t("Tipo")}
                <select name="tipo">
                  <option value="tranca">{t("Tranca")}</option>
                  <option value="cadastrador">{t("Cadastrador")}</option>
                </select>
              </label>
              <label>
                {t("Sala (apenas tranca)")}
                <select name="sala">
                  <option value="">{t("Selecione")}</option>
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
          <button>{t("Salvar")}</button>
        </>
      )}
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
