import { useRef } from 'react';
import { ChecklistBlock } from '../../components/ChecklistBlock';
import { ComprasBlock } from '../../components/ComprasBlock';
import { InspiracoesBlock } from '../../components/InspiracoesBlock';
import { toast } from '../../components/toastStore';
import { Card, CardTitle, Chip, ViewHead } from '../../components/ui';
import { useStore } from '../../store/useStore';
import type { TipoChavePix } from '../../types';

const TIPOS_PIX: TipoChavePix[] = ['Chave PIX', 'CPF', 'Celular', 'E-mail', 'Aleatória'];

const CHIPS_CONVITE = [
  'Papel texturizado',
  'Aquarela floral',
  'Lacre de cera',
  'Cordão de algodão',
  'Tipografia clássica',
];

const PECAS_FISICAS = [
  'Cartaz "Bem-vindos" na entrada',
  'Base/cavalete do quadro de formatura',
  'Cartaz da mesa de presentes + QR PIX',
  'Tags de mesa / plaquinhas',
  'Lembrancinhas',
];

export function Papelaria() {
  const pix = useStore((s) => s.pix);
  const setPix = useStore((s) => s.setPix);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPix('imagem', String(reader.result));
      toast('QR do PIX salvo');
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <ViewHead
        eyebrow="Papelaria & Recepção"
        title="✉️ Papelaria & Recepção"
        desc="Tudo que você mesma vai produzir: convites, lembrancinhas, os cartazes do dia e a mesa de presentes com o PIX."
      />

      <Card>
        <CardTitle ic="💌">Convite — direção criativa</CardTitle>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
          Nada minimalista: papel texturizado, florais em aquarela, tipografia clássica, lacre de
          cera, cordão de algodão e uma ilustração botânica delicada.
        </p>
        <div className="chiprow">
          {CHIPS_CONVITE.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle ic="🎁">Mesa de presentes &amp; PIX</CardTitle>
        <p className="card-sub">
          O cartaz da entrada da mesa de presentes com o QR do PIX. Suba a imagem do seu QR para já
          montar o "quadro".
        </p>
        <div className="pix-wrap">
          <label className="qr-drop" onClick={() => fileRef.current?.click()}>
            {pix.imagem ? (
              <img src={pix.imagem} alt="QR do PIX" />
            ) : (
              <>
                📷
                <br />
                Enviar imagem do QR PIX
              </>
            )}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />
          <div>
            <label className="fld">Tipo de chave</label>
            <select
              value={pix.tipo}
              onChange={(e) => setPix('tipo', e.target.value as TipoChavePix)}
            >
              {TIPOS_PIX.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <label className="fld" style={{ marginTop: 10 }}>
              Chave / texto do cartaz
            </label>
            <input
              value={pix.chave}
              placeholder="sua chave PIX"
              onChange={(e) => setPix('chave', e.target.value)}
            />
            <p className="empty" style={{ paddingTop: 8 }}>
              Dica: no dia, imprima este bloco em papel texturizado e apoie num cavalete pequeno ao
              lado do quadro de formatura.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle ic="🪧">Peças físicas do dia</CardTitle>
        <p className="card-sub">O que precisa estar impresso/produzido e montado no espaço.</p>
        <div className="chiprow">
          {PECAS_FISICAS.map((p) => (
            <Chip key={p}>{p}</Chip>
          ))}
        </div>
      </Card>

      <div className="grid two" style={{ marginTop: 18 }}>
        <ChecklistBlock cat="papelaria" />
        <ComprasBlock cat="papelaria" />
      </div>

      <InspiracoesBlock cat="papelaria" />
    </>
  );
}
