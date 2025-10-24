import { useEffect, useMemo, useRef } from 'react'

export type MathEngine = 'asciimath' | 'tex'

export interface MathProps {
    value: string
    engine?: MathEngine
    inline?: boolean
    className?: string
}

// Small utility to wrap the expression with appropriate delimiters
function wrapExpr(expr: string, engine: MathEngine, inline: boolean): string {
    if (engine === 'asciimath') {
        // MathJax v2 AM_CHTML default delimiters are backticks `...`
        return inline ? `\`${expr}\`` : `\`${expr}\``
    }
    // TeX: use $...$ for inline, $$...$$ for display
    return inline ? `$${expr}$` : `$$${expr}$$`
}

export default function Math({
    value,
    engine = 'asciimath',
    inline = false,
    className,
}: MathProps) {
    const elRef = useRef<HTMLElement | null>(null)

    const content = useMemo(
        () => wrapExpr(value, engine, inline),
        [value, engine, inline]
    )

    useEffect(() => {
        const mj: any = (window as any).MathJax
        const el = elRef.current
        if (!mj || !el) return

        // v3 preferred API
        if (typeof mj.typesetPromise === 'function') {
            // Limit typesetting to this node for performance
            mj.typesetPromise([el]).catch(() => {})
            return
        }
        // v2 fallback
        if (mj.Hub && typeof mj.Hub.Queue === 'function') {
            mj.Hub.Queue(['Typeset', mj.Hub, el])
        }
    }, [content])

    if (inline) {
        return (
            <span
                ref={(el) => {
                    elRef.current = el
                }}
                className={className}
            >
                {content}
            </span>
        )
    }

    return (
        <div
            ref={(el) => {
                elRef.current = el
            }}
            className={className}
        >
            {content}
        </div>
    )
}
