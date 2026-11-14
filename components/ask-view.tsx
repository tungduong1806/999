import { pageX } from '@/lib/ui'
import { Credits } from './credits'
import { SectionTitle } from './states'

export function AskView() {
  return (
    <>
      <section className={`${pageX} flex max-w-[560px] flex-col gap-4 py-10`} aria-labelledby="ask-heading">
        <SectionTitle id="ask-heading">Hỏi thăm</SectionTitle>
        <p className="text-lg text-pretty">
          Tính năng này sẽ có ở phiên bản 2. Bạn sẽ soạn nhanh tin nhắn hỏi người nhà về tình hình mưa lũ ở quê.
        </p>
        <p className="text-ink-muted">
          Phiên bản này chỉ hiển thị số liệu mô hình từ Open-Meteo và không gửi dữ liệu của bạn đi đâu.
        </p>
      </section>
      <Credits />
    </>
  )
}
