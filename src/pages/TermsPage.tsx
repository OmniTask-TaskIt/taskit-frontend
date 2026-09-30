import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import bgImage from '../assets/FondoP.jpeg';
import logoImage from '../assets/Logo.jpeg';

/**
 * Términos y Condiciones + Política de Privacidad, servidos como parte del
 * bundle del front en vez de un link a Azure Blob con SAS token.
 *
 * El link anterior (a taskit.blob.core.windows.net/...) usaba un SAS token
 * con fecha de expiración fija (`se=2026-09-17T02:10:47Z`), así que ya
 * devuelve 403 y el checkbox de registro apuntaba a un enlace roto. Esta
 * página no depende de credenciales que caduquen; si el contenido legal
 * cambia, solo hay que actualizar este archivo (y subir termsVersion en el
 * backend, como ya prevé la Sección 6 del documento).
 */
export default function TermsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#f0edf4]">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/register"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#263BAA] hover:underline"
        >
          <ArrowLeft size={16} /> Volver al registro
        </Link>

        <div className="rounded-3xl border border-[#e2e5f5] bg-white/95 p-6 shadow-[0_24px_70px_rgba(54,63,115,0.12)] sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <img src={logoImage} alt="TaskIt" className="h-12 w-12 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-bold text-[#17213f] sm:text-2xl">Términos y Condiciones de Uso</h1>
              <p className="text-xs text-[#6b7696]">
                y Política de Privacidad · TaskIt Platform · OmniTask Solutions S.A. · Versión 1.0 · Septiembre de 2026
              </p>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-[#34405f]">
            Bienvenido a <strong>TaskIt Platform</strong>, un ecosistema digital de marketplace bilateral operado por{' '}
            <strong>OmniTask Solutions S.A.</strong> Al registrarse, acceder o utilizar nuestra plataforma web y móvil,
            usted (en adelante, el "Usuario") acepta quedar vinculado legalmente por los presentes Términos y
            Condiciones de Uso y nuestra Política de Privacidad. Si no está de acuerdo con estos términos, no debe
            utilizar la plataforma.
          </p>

          <Section title="1. Definiciones y naturaleza del servicio">
            <List
              items={[
                <>
                  <strong>TaskIt Platform:</strong> sistema centralizado de la compañía que interconecta la oferta y
                  la demanda de servicios generales, tareas cotidianas y actividades profesionales.
                </>,
                <>
                  <strong>Task Seeker (Demandante):</strong> usuario registrado que publica necesidades, contrata
                  servicios y realiza pagos a través de la plataforma.
                </>,
                <>
                  <strong>Task Provider (Prestador):</strong> usuario verificado que ofrece sus habilidades, acepta
                  tareas y ejecuta servicios para generar ingresos de manera flexible.
                </>,
                <>
                  <strong>OmniTask Solutions S.A.:</strong> entidad jurídica intermediaria de tecnología que provee la
                  infraestructura digital del marketplace. La empresa no es empleadora de los Prestadores ni provee
                  directamente los servicios físicos ofrecidos.
                </>,
              ]}
            />
          </Section>

          <Section title="2. Registro de cuenta y verificación de identidad">
            <List
              items={[
                'Para operar en la plataforma, el Usuario debe registrarse proporcionando información veraz y completando el proceso de validación por correo electrónico mediante código temporal OTP (One-Time Password).',
                'Los Prestadores de servicios están obligados a someterse a procesos de verificación de identidad mediante la carga de documentos oficiales (cédula o pasaporte), revisados para garantizar la confianza y seguridad de la comunidad.',
                'El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de cualquier actividad realizada bajo su cuenta.',
              ]}
            />
          </Section>

          <Section title="3. Reglas del marketplace y prohibiciones">
            <p className="mb-2 text-sm text-[#34405f]">Queda estrictamente prohibido para todos los usuarios:</p>
            <List
              items={[
                'Cometer fraudes, suplantar identidades o publicar tareas ficticias.',
                'Realizar transacciones de pago fuera de los canales oficiales integrados en la plataforma para evadir comisiones o controles de seguridad.',
                'Ofrecer o ejecutar tareas de carácter ilegal, violento, sexual o que pongan en riesgo la integridad física de las personas.',
                'Utilizar sistemas automatizados (bots o scrapers) no autorizados sobre el núcleo central del sistema.',
              ]}
            />
          </Section>

          <Section title="4. Modelo de transacciones y retención de fondos (Escrow)">
            <List
              items={[
                'Todos los pagos se gestionan a través de pasarelas de pago externas autorizadas (ej. Mercado Pago), aplicando esquemas de Split Payments y retención temporal de fondos (Escrow / Depósito en Garantía).',
                'Las comisiones de servicio y los costos operativos de la pasarela de pagos se informan de manera transparente antes de confirmar cada transacción.',
              ]}
            />
            <div className="mt-3 rounded-xl bg-[#eef2ff] p-3 text-xs text-[#34405f]">
              <strong>Política de Cero Tenencia:</strong> OmniTask Solutions S.A. no opera como una entidad financiera
              ni custodia saldos monetarios en billeteras digitales propias; los fondos del Demandante quedan
              retenidos de forma segura en la pasarela externa hasta que la tarea sea marcada como completada con
              éxito o se resuelva una disputa.
            </div>
          </Section>

          <Section title="5. Moderación, resolución de disputas y módulo HITL">
            <List
              items={[
                'Ante reportes de anomalías, incumplimientos o disputas entre Demandantes y Prestadores, interviene el equipo de moderación mediante el módulo de auditoría e intervención humana (Audit & HITL Service).',
                'Las decisiones tomadas por los moderadores respecto a la retención, liberación o reembolso de fondos retenidos en garantía son de carácter vinculante para resolver el caso dentro del ecosistema.',
              ]}
            />
          </Section>

          <Section title="6. Control de versiones de los términos">
            <p className="text-sm leading-relaxed text-[#34405f]">
              Estos términos corresponden a la <strong>Versión 1.0</strong>. OmniTask Solutions S.A. se reserva el
              derecho de modificar o actualizar este documento en cualquier momento. Los cambios sustanciales serán
              notificados a los usuarios, exigiendo una nueva aceptación digital para continuar operando en la
              plataforma.
            </p>
          </Section>

          <Section title="7. Información que recopilamos">
            <List
              items={[
                <>
                  <strong>Datos de registro:</strong> correo electrónico, nombre completo, contraseña cifrada
                  (hashing y salting con Bcrypt) y rol seleccionado (Seeker o Provider).
                </>,
                <>
                  <strong>Datos de verificación de identidad:</strong> documentos oficiales (cédulas, pasaportes) y
                  fotografías de validación subidas por los prestadores.
                </>,
                <>
                  <strong>Datos de transacciones:</strong> información de pagos, identificadores de órdenes y
                  estados de cobro gestionados a través de la pasarela externa.
                </>,
                <>
                  <strong>Metadatos técnicos y de seguridad:</strong> direcciones IP de acceso, registros de
                  auditoría de intentos de inicio de sesión fallidos y metadatos legales de aceptación de términos.
                </>,
              ]}
            />
          </Section>

          <Section title="8. Finalidad del tratamiento de datos">
            <List
              items={[
                'Operar, mantener y mejorar las funcionalidades del núcleo central del sistema y sus microservicios asociados.',
                'Validar la autenticidad de las cuentas mediante códigos OTP y el proceso de verificación de documentos.',
                'Garantizar la seguridad de la comunidad, previniendo fraudes, mitigando ataques de fuerza bruta por IP y aplicando revisiones de moderación mediante el servicio HITL.',
                'Procesar de forma segura las transacciones financieras y cumplir con las obligaciones normativas y legales aplicables.',
              ]}
            />
          </Section>

          <Section title="9. Almacenamiento y seguridad de la información">
            <List
              items={[
                'Cifrado en reposo y en tránsito: todos los datos sensibles, credenciales y documentos de identidad se almacenan y transmiten bajo protocolos de cifrado de la industria.',
                'Aislamiento de sesiones: la gestión de sesiones se realiza mediante tokens seguros (JWT) de corta duración respaldados por almacenamiento distribuido en caché con cifrado TLS obligatorio.',
              ]}
            />
          </Section>

          <Section title="10. Derechos de los usuarios">
            <List
              items={[
                'Acceder, rectificar o actualizar su información personal desde los ajustes de su perfil.',
                'Solicitar la eliminación de su cuenta y de sus datos asociados, condicionado a la inexistencia de disputas activas u obligaciones financieras pendientes de resolución en la plataforma.',
              ]}
            />
          </Section>

          <div className="mt-6 rounded-xl border border-[#e2e5f5] bg-[#f6f4fa] p-4 text-xs leading-relaxed text-[#6b7696]">
            <strong className="text-[#34405f]">Aceptación del Usuario.</strong> El uso continuado de TaskIt Platform
            implica la aceptación plena de los presentes Términos y Condiciones de Uso y de esta Política de
            Privacidad. Ante cualquier duda, el Usuario puede contactar al equipo de soporte de OmniTask Solutions
            S.A.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-bold text-[#17213f] sm:text-base">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#34405f]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
