'use client'

import { Layers3 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const levels = [{ color: '#00e400', name: 'Tốt', range: '0–50' }, { color: '#ffff00', name: 'Trung bình', range: '51–100' }, { color: '#ff7e00', name: 'Không tốt cho nhóm nhạy cảm', range: '101–150' }, { color: '#ff0000', name: 'Không tốt', range: '151–200' }, { color: '#8f3f97', name: 'Rất không tốt', range: '201–300' }, { color: '#7e0023', name: 'Nguy hại', range: '301+' }]

export function LayerControls({ enabled, active, opacity, onChange, onOpacity, error }: { enabled: boolean; active: boolean; opacity: number; onChange: (value: boolean) => void; onOpacity: (value: number) => void; error: string | null }) {
  return <div className="wx-layer-card">
    <label className="wx-layer-toggle"><Layers3 size={16} aria-hidden="true" /><span>Lớp AQI</span><Switch aria-label="Lớp phủ chất lượng không khí" checked={active} onCheckedChange={onChange} disabled={!enabled} /></label>
    {!enabled && <p className="wx-layer-caption">Cần kết nối Google Maps và Air Quality API.</p>}
    {enabled && active && <div className="wx-layer-detail">
      <label className="wx-opacity"><span>Độ mờ <output>{Math.round(opacity * 100)}%</output></span><input type="range" min={0} max={100} step={5} value={opacity * 100} onChange={event => onOpacity(Number(event.target.value) / 100)} aria-label="Độ mờ lớp AQI" /></label>
      {error ? <p className="wx-layer-caption" role="status">{error}</p> : <div className="wx-legend" aria-label="Chú giải chỉ số AQI Hoa Kỳ">
        <div className="wx-legend-strip">{levels.map(level => <span key={level.name} style={{ background: level.color }} title={`${level.name}: ${level.range}`} />)}</div>
        <p><span>Tốt</span><span>Nguy hại</span></p>
        <ul className="sr-only">{levels.map(level => <li key={level.name}>{level.range}: {level.name}</li>)}</ul>
        <small>US AQI · Việt Nam · Zoom từ 5</small>
      </div>}
    </div>}
  </div>
}
