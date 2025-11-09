"use client";

import { useMemo, useState } from "react";

function toNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatNumber(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

function DegreesInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="input-row">
      <label>Angle ? (degrees)</label>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g., 30" />
    </div>
  );
}

function WorkCalculator() {
  const [force, setForce] = useState("50"); // newtons
  const [distance, setDistance] = useState("10"); // meters
  const [angle, setAngle] = useState("0"); // degrees

  const workJoules = useMemo(() => {
    const F = toNumber(force);
    const d = toNumber(distance);
    const thetaRad = (toNumber(angle) * Math.PI) / 180;
    return F * d * Math.cos(thetaRad);
  }, [force, distance, angle]);

  return (
    <section className="card">
      <h3>Work Calculator</h3>
      <p className="badge">Formula: W = F ? d ? cos(?)</p>
      <div className="input-row">
        <label>Force F (newton, N)</label>
        <input inputMode="decimal" value={force} onChange={(e) => setForce(e.target.value)} placeholder="e.g., 50" />
      </div>
      <div className="input-row">
        <label>Displacement d (meter, m)</label>
        <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g., 10" />
      </div>
      <DegreesInput value={angle} onChange={setAngle} />
      <div className="result">
        <strong>Work W:</strong> {formatNumber(workJoules)} J (joules)
      </div>
      <small>1 J = 1 N?m</small>
    </section>
  );
}

function PowerEnergyCalculator() {
  const [mode, setMode] = useState<"power" | "energy">("power");
  const [energyInput, setEnergyInput] = useState("0.5"); // kWh
  const [timeHours, setTimeHours] = useState("1"); // h

  const [powerInput, setPowerInput] = useState("1000"); // W
  const [timeHours2, setTimeHours2] = useState("2"); // h

  const powerFromEnergy = useMemo(() => {
    const E_kWh = toNumber(energyInput);
    const t_h = Math.max(toNumber(timeHours), 0.000001);
    const E_J = E_kWh * 3_600_000; // 1 kWh = 3.6e6 J
    return E_J / (t_h * 3600);
  }, [energyInput, timeHours]);

  const energyFromPower_kWh = useMemo(() => {
    const P_W = toNumber(powerInput);
    const t_h = toNumber(timeHours2);
    const E_J = P_W * t_h * 3600;
    return E_J / 3_600_000;
  }, [powerInput, timeHours2]);

  return (
    <section className="card">
      <h3>Energy & Power Calculator</h3>
      <div className="button-row" style={{ marginBottom: 10 }}>
        <button className={`button ${mode === "power" ? "" : "secondary"}`} onClick={() => setMode("power")}>Compute Power</button>
        <button className={`button ${mode === "energy" ? "" : "secondary"}`} onClick={() => setMode("energy")}>Compute Energy</button>
      </div>

      {mode === "power" ? (
        <>
          <p className="badge">P = E / t</p>
          <div className="input-row">
            <label>Energy E (kilowatt-hour, kWh)</label>
            <input inputMode="decimal" value={energyInput} onChange={(e) => setEnergyInput(e.target.value)} />
          </div>
          <div className="input-row">
            <label>Time t (hours)</label>
            <input inputMode="decimal" value={timeHours} onChange={(e) => setTimeHours(e.target.value)} />
          </div>
          <div className="result"><strong>Power P:</strong> {formatNumber(powerFromEnergy)} W</div>
          <small>1 kW = 1000 W</small>
        </>
      ) : (
        <>
          <p className="badge">E = P ? t</p>
          <div className="input-row">
            <label>Power P (watt, W)</label>
            <input inputMode="decimal" value={powerInput} onChange={(e) => setPowerInput(e.target.value)} />
          </div>
          <div className="input-row">
            <label>Time t (hours)</label>
            <input inputMode="decimal" value={timeHours2} onChange={(e) => setTimeHours2(e.target.value)} />
          </div>
          <div className="result"><strong>Energy E:</strong> {formatNumber(energyFromPower_kWh, 4)} kWh</div>
          <small>Commercial unit of energy is kWh (also called unit).</small>
        </>
      )}
    </section>
  );
}

function BillCalculator() {
  type Row = { id: number; name: string; powerW: string; hoursPerDay: string; days: string };
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: "LED Bulb", powerW: "10", hoursPerDay: "5", days: "30" },
    { id: 2, name: "Fan", powerW: "70", hoursPerDay: "8", days: "30" },
  ]);
  const [rate, setRate] = useState("0.12"); // $/kWh
  const [fixed, setFixed] = useState("2.50"); // $ fixed charges
  const [taxPct, setTaxPct] = useState("5"); // %

  const totals = useMemo(() => {
    let energyKWh = 0;
    for (const r of rows) {
      const PkW = toNumber(r.powerW) / 1000;
      const hours = toNumber(r.hoursPerDay) * toNumber(r.days);
      energyKWh += PkW * hours;
    }
    const energyCost = energyKWh * toNumber(rate);
    const subtotal = energyCost + toNumber(fixed);
    const tax = (toNumber(taxPct) / 100) * subtotal;
    const total = subtotal + tax;
    return { energyKWh, energyCost, subtotal, tax, total };
  }, [rows, rate, fixed, taxPct]);

  return (
    <section className="card">
      <h3>Electricity Bill Estimator</h3>
      <p className="badge">1 unit = 1 kWh</p>
      <table className="table">
        <thead>
          <tr>
            <th>Appliance</th>
            <th>Power (W)</th>
            <th>Hours/Day</th>
            <th>Days</th>
            <th>Energy (kWh)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const energy = (toNumber(r.powerW) / 1000) * (toNumber(r.hoursPerDay) * toNumber(r.days));
            return (
              <tr key={r.id}>
                <td>
                  <input value={r.name} onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} />
                </td>
                <td>
                  <input inputMode="decimal" value={r.powerW} onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, powerW: e.target.value } : x))} />
                </td>
                <td>
                  <input inputMode="decimal" value={r.hoursPerDay} onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, hoursPerDay: e.target.value } : x))} />
                </td>
                <td>
                  <input inputMode="decimal" value={r.days} onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, days: e.target.value } : x))} />
                </td>
                <td>{formatNumber(energy, 3)}</td>
                <td>
                  <button className="button secondary" onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}>Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="button-row" style={{ marginTop: 10 }}>
        <button className="button" onClick={() => setRows((prev) => [...prev, { id: Date.now(), name: "Appliance", powerW: "100", hoursPerDay: "1", days: "30" }])}>Add Appliance</button>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="input-row"><label>Rate ($/kWh)</label><input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
          <div className="input-row"><label>Fixed charges ($)</label><input inputMode="decimal" value={fixed} onChange={(e) => setFixed(e.target.value)} /></div>
          <div className="input-row"><label>Taxes (%)</label><input inputMode="decimal" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} /></div>
        </div>
        <div className="card" style={{ gridColumn: "span 8" }}>
          <p><strong>Total Energy:</strong> {formatNumber(totals.energyKWh, 3)} kWh</p>
          <p><strong>Energy Cost:</strong> ${formatNumber(totals.energyCost, 2)}</p>
          <p><strong>Subtotal:</strong> ${formatNumber(totals.subtotal, 2)} <span className="muted">(incl. fixed)</span></p>
          <p><strong>Tax:</strong> ${formatNumber(totals.tax, 2)}</p>
          <div className="result"><strong>Estimated Bill:</strong> ${formatNumber(totals.total, 2)}</div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
      <section className="card" style={{ gridColumn: "span 12" }}>
        <h2 className="section-title">Definitions & Key Ideas</h2>
        <ul>
          <li><strong>Work (W)</strong>: Work is energy transferred when a force causes displacement. W = F ? d ? cos(?).</li>
          <li><strong>Unit of work</strong>: joule (J). 1 J = 1 newton?meter (1 N?m).</li>
          <li><strong>Force (F)</strong>: A push or pull, unit newton (N).</li>
          <li><strong>Energy</strong>: Capacity to do work, measured in joules (J) or in electrical contexts kilowatt-hour (kWh).</li>
          <li><strong>Power (P)</strong>: Rate of doing work or using energy. P = W/t = E/t. Unit watt (W).</li>
          <li><strong>Power rating</strong>: The rate at which a device consumes or delivers energy (e.g., a 1000 W heater).</li>
          <li><strong>Commercial unit of energy</strong>: kilowatt-hour (kWh), commonly called a ?unit?.</li>
        </ul>
      </section>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <h2 className="section-title">Simple Machines</h2>
        <p><strong>How they help</strong>: Simple machines trade force and distance/time to make tasks easier by providing a mechanical advantage. You do the same or more work, but the required input force is reduced.</p>
        <p><strong>Lever example</strong>: A lever has a fulcrum. With a longer effort arm than load arm, a small effort lifts a large load. Ideal Mechanical Advantage (IMA) = effort arm length / load arm length.</p>
        <p><strong>Why mountain roads are winding</strong>: A gentle slope increases the distance over which a vehicle gains height, reducing the required force and engine strain for a given power. This spreads the work over more distance/time, improving safety and traction.</p>
      </div>

      <div style={{ gridColumn: "span 6" }}><WorkCalculator /></div>
      <div style={{ gridColumn: "span 6" }}><PowerEnergyCalculator /></div>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <h2 className="section-title">Examples</h2>
        <ul>
          <li><strong>Work</strong>: Pulling with 50 N over 10 m along motion (? = 0?): W = 50 ? 10 ? cos0 = 500 J.</li>
          <li><strong>Power</strong>: Doing 3000 J in 10 s ? P = 300 W. A 60 W bulb uses 60 J each second.</li>
          <li><strong>Energy from power rating</strong>: 1 kW heater for 2 h uses E = 1 ? 2 = 2 kWh.</li>
        </ul>
      </div>

      <div style={{ gridColumn: "span 12" }}><BillCalculator /></div>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <h2 className="section-title">Units Quick Reference</h2>
        <ul>
          <li><strong>Force</strong>: newton (N)</li>
          <li><strong>Work/Energy</strong>: joule (J), kilowatt-hour (kWh)</li>
          <li><strong>Power</strong>: watt (W), kilowatt (kW)</li>
        </ul>
      </div>
    </div>
  );
}
