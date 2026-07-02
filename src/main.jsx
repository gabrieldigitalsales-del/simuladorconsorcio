import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Info,
  Save,
  Trash2,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'vibra-consorcio-layout-aprovado-v1';
const LOGO_URL = `${import.meta.env.BASE_URL}vibra-logo.png`;

const ACCENT_PALETTE = [
  '#3157D5',
  '#159EAE',
  '#D99B25',
  '#EE6656',
  '#6D5ACF',
  '#2E8C69',
  '#C65B8F',
  '#337FA6',
];

const SCENARIO_KEYS = ['scenario1', 'scenario2', 'scenario3', 'scenario4'];

const ROW_DEFINITIONS = [
  { id: 'valorCarta', label: 'Valor total da carta', placeholder: 'Ex.: R$ 500.000,00', kind: 'short' },
  { id: 'creditoLiquido', label: 'Valor do crédito líquido', placeholder: 'Ex.: R$ 375.000,00', kind: 'short' },
  { id: 'prazo', label: 'Prazo', placeholder: 'Ex.: 180 meses', kind: 'short' },
  { id: 'lanceEmbutidoPct', label: 'Lance embutido %', placeholder: 'Ex.: 25%', kind: 'short' },
  { id: 'lanceEmbutidoValor', label: 'Lance embutido valor', placeholder: 'Ex.: R$ 125.000,00', kind: 'short' },
  { id: 'lanceAdicional', label: 'Lance adicional', placeholder: 'Ex.: R$ 50.000,00', kind: 'short' },
  { id: 'totalLanceValor', label: 'Total do lance valor', placeholder: 'Ex.: R$ 175.000,00', kind: 'short' },
  { id: 'totalLancePct', label: 'Total do lance %', placeholder: 'Ex.: 35%', kind: 'short' },
  { id: 'consorcio', label: 'Consórcio', placeholder: 'Ex.: Embracon', kind: 'short' },
  { id: 'quantidadeCartas', label: 'Quantidade de cartas', placeholder: 'Ex.: 2', kind: 'short' },
  { id: 'taxaAdm', label: 'Taxa adm.', placeholder: 'Ex.: 18%', kind: 'short' },
  { id: 'fundoReserva', label: 'Fundo de reserva', placeholder: 'Ex.: 2%', kind: 'short' },
  { id: 'taxaAdesao', label: 'Taxa de adesão', placeholder: 'Ex.: 1%', kind: 'short' },
  { id: 'taxaTotal', label: 'Taxa total a ser paga', placeholder: 'Ex.: 21%', kind: 'short' },
  { id: 'seguroPrestamista', label: 'Seguro prestamista', placeholder: 'Ex.: sem seguro ou R$ 350,00', kind: 'short' },
  { id: 'primeiraParcela', label: 'Primeira parcela', placeholder: 'Ex.: R$ 5.000,00', kind: 'short' },
  { id: 'parcelaAte', label: 'Parcela até contemplação', placeholder: 'Ex.: R$ 3.500,00', kind: 'short' },
  { id: 'parcelaApos', label: 'Parcela após contemplação', placeholder: 'Ex.: R$ 4.100,00 ou descreva a condição', kind: 'medium' },
  { id: 'participantes', label: 'Número de participantes', placeholder: 'Ex.: 3.000', kind: 'short' },
  { id: 'observacoes', label: 'Observações', placeholder: 'Digite observações do cenário...', kind: 'large' },
];

function shuffledColors() {
  const colors = [...ACCENT_PALETTE];
  for (let i = colors.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  return colors.slice(0, 4);
}

function createBlankState() {
  const colors = shuffledColors();
  return {
    scenarios: SCENARIO_KEYS.map((key, index) => ({
      key,
      name: '',
      color: colors[index],
      includePdf: true,
    })),
    rows: ROW_DEFINITIONS.map((row) => ({
      ...row,
      includePdf: true,
      values: Object.fromEntries(SCENARIO_KEYS.map((key) => [key, ''])),
    })),
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createBlankState();
    const parsed = JSON.parse(saved);

    const fallback = createBlankState();
    return {
      scenarios: fallback.scenarios.map((scenario, index) => ({
        ...scenario,
        ...(parsed.scenarios?.[index] ?? {}),
        key: scenario.key,
      })),
      rows: fallback.rows.map((row) => {
        const savedRow = parsed.rows?.find((item) => item.id === row.id);
        return {
          ...row,
          includePdf: savedRow?.includePdf ?? true,
          values: {
            ...row.values,
            ...(savedRow?.values ?? {}),
          },
        };
      }),
    };
  } catch {
    return createBlankState();
  }
}

function fallbackScenarioName(scenario, index) {
  return scenario.name.trim() || `Cenário ${index + 1}`;
}

function App() {
  const [data, setData] = useState(loadState);
  const [saveStatus, setSaveStatus] = useState('Pronto para preencher');

  const includedRows = useMemo(
    () => data.rows.filter((row) => row.includePdf),
    [data.rows],
  );

  const includedScenarios = useMemo(
    () => data.scenarios.filter((scenario) => scenario.includePdf),
    [data.scenarios],
  );

  function updateScenario(key, patch) {
    setData((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario) =>
        scenario.key === key ? { ...scenario, ...patch } : scenario,
      ),
    }));
    setSaveStatus('Alterações não salvas');
  }

  function updateRowVisibility(rowId, includePdf) {
    setData((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === rowId ? { ...row, includePdf } : row,
      ),
    }));
    setSaveStatus('Alterações não salvas');
  }

  function updateCell(rowId, scenarioKey, value) {
    setData((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [scenarioKey]: value } }
          : row,
      ),
    }));
    setSaveStatus('Alterações não salvas');
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaveStatus('Salvo neste dispositivo');
  }

  function clearData() {
    const confirmed = window.confirm(
      'Deseja limpar todos os nomes e valores preenchidos? As cores e seleções do PDF serão mantidas.',
    );
    if (!confirmed) return;

    setData((current) => ({
      scenarios: current.scenarios.map((scenario) => ({ ...scenario, name: '' })),
      rows: current.rows.map((row) => ({
        ...row,
        values: Object.fromEntries(SCENARIO_KEYS.map((key) => [key, ''])),
      })),
    }));
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus('Campos limpos');
  }

  function exportPdf() {
    if (includedRows.length === 0 || includedScenarios.length === 0) {
      window.alert('Marque pelo menos uma informação e um cenário para gerar o PDF.');
      return;
    }
    window.print();
  }

  return (
    <div className="appShell">
      <header className="appHeader noPrint">
        <div className="brandArea">
          <img src={LOGO_URL} alt="Vibra Soluções" />
          <div className="brandDivider" />
          <div>
            <h1>Simulações de Consórcio</h1>
            <p>Comparativo editável de propostas</p>
          </div>
        </div>

        <div className="headerActions">
          <button className="actionButton" type="button" onClick={exportPdf}>
            <FileDown size={18} />
            Exportar PDF
          </button>
          <button className="actionButton" type="button" onClick={clearData}>
            <Trash2 size={18} />
            Limpar
          </button>
          <button className="actionButton actionPrimary" type="button" onClick={saveData}>
            <Save size={18} />
            Salvar
          </button>
        </div>
      </header>

      <main className="workspace noPrint">
        <section className="utilityBar" aria-label="Informações da planilha">
          <div className="utilityItem">
            <CheckCircle2 size={17} />
            <span>{includedRows.length} de {data.rows.length} informações no PDF</span>
          </div>
          <div className="utilitySeparator" />
          <div className="utilityItem">
            <Eye size={17} />
            <span>{includedScenarios.length} de 4 cenários no PDF</span>
          </div>
          <div className="utilitySeparator" />
          <div className="utilityItem utilityHelp">
            <Info size={17} />
            <span>Digite os nomes e valores diretamente na planilha. Os campos começam vazios.</span>
          </div>
          <div className="saveStatus">{saveStatus}</div>
        </section>

        <section className="sheetCard">
          <div className="tableViewport">
            <table className="editorTable">
              <colgroup>
                <col className="infoColumn" />
                {data.scenarios.map((scenario) => (
                  <col className="scenarioColumn" key={scenario.key} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="infoHeaderCell">Informação</th>
                  {data.scenarios.map((scenario, index) => (
                    <th
                      className="scenarioHeaderCell"
                      key={scenario.key}
                      style={{ '--scenario-color': scenario.color }}
                    >
                      <div className="scenarioAccent" />
                      <div className="scenarioHeaderTop">
                        <span>Cenário {index + 1}</span>
                        <label className="pdfToggle" title="Incluir este cenário no PDF">
                          <input
                            type="checkbox"
                            checked={scenario.includePdf}
                            onChange={(event) =>
                              updateScenario(scenario.key, { includePdf: event.target.checked })
                            }
                          />
                          <span className="toggleVisual"><Check size={12} /></span>
                          <span className="toggleLabel">PDF</span>
                        </label>
                      </div>
                      <input
                        className="scenarioNameInput"
                        value={scenario.name}
                        onChange={(event) =>
                          updateScenario(scenario.key, { name: event.target.value })
                        }
                        placeholder="Digite o nome do cenário"
                        aria-label={`Nome do cenário ${index + 1}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr className={`dataRow row-${row.kind}`} key={row.id}>
                    <th scope="row" className="rowLabelCell">
                      <span>{row.label}</span>
                      <label className="rowSelector" title="Incluir esta informação no PDF">
                        <input
                          type="checkbox"
                          checked={row.includePdf}
                          onChange={(event) => updateRowVisibility(row.id, event.target.checked)}
                        />
                        <span><Check size={13} /></span>
                      </label>
                    </th>
                    {data.scenarios.map((scenario, scenarioIndex) => (
                      <td
                        key={scenario.key}
                        className="valueCell"
                        style={{ '--scenario-color': scenario.color }}
                      >
                        {row.kind === 'short' ? (
                          <input
                            value={row.values[scenario.key]}
                            onChange={(event) =>
                              updateCell(row.id, scenario.key, event.target.value)
                            }
                            placeholder={row.placeholder}
                            aria-label={`${row.label} — cenário ${scenarioIndex + 1}`}
                          />
                        ) : (
                          <textarea
                            value={row.values[scenario.key]}
                            onChange={(event) =>
                              updateCell(row.id, scenario.key, event.target.value)
                            }
                            placeholder={row.placeholder}
                            aria-label={`${row.label} — cenário ${scenarioIndex + 1}`}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="previewCard">
          <div className="previewHeader">
            <div className="previewTitle">
              <Eye size={19} />
              <div>
                <h2>Pré-visualização PDF</h2>
                <p>Somente as informações e os cenários marcados serão exibidos.</p>
              </div>
            </div>
            <button className="previewButton" type="button" onClick={exportPdf}>
              <FileText size={17} />
              Abrir prévia / imprimir
            </button>
          </div>

          {includedRows.length > 0 && includedScenarios.length > 0 ? (
            <div className="previewViewport">
              <table className="previewTable">
                <thead>
                  <tr>
                    <th>Informações</th>
                    {includedScenarios.map((scenario) => {
                      const originalIndex = data.scenarios.findIndex((item) => item.key === scenario.key);
                      return (
                        <th key={scenario.key} style={{ '--scenario-color': scenario.color }}>
                          {fallbackScenarioName(scenario, originalIndex)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {includedRows.map((row) => (
                    <tr key={row.id}>
                      <th>{row.label}</th>
                      {includedScenarios.map((scenario) => (
                        <td key={scenario.key}>
                          {row.values[scenario.key] || <span className="emptyValue">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="emptyPreview">
              Marque pelo menos uma informação e um cenário para visualizar o PDF.
            </div>
          )}
        </section>
      </main>

      <section className="printOnly printSheet">
        <header className="printHeader">
          <img src={LOGO_URL} alt="Vibra Soluções" />
          <div>
            <h1>Proposta de Consórcio</h1>
            <p>Comparativo de cenários</p>
          </div>
        </header>

        <table className="printTable">
          <thead>
            <tr>
              <th>Informações</th>
              {includedScenarios.map((scenario) => {
                const originalIndex = data.scenarios.findIndex((item) => item.key === scenario.key);
                return (
                  <th key={scenario.key} style={{ '--scenario-color': scenario.color }}>
                    {fallbackScenarioName(scenario, originalIndex)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {includedRows.map((row) => (
              <tr className={row.kind === 'large' ? 'printObservationRow' : ''} key={row.id}>
                <th>{row.label}</th>
                {includedScenarios.map((scenario) => (
                  <td key={scenario.key}>{row.values[scenario.key] || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="printFooter">
          <span>Vibra Soluções</span>
          <span>Simulação sujeita à análise e disponibilidade da administradora.</span>
        </footer>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
