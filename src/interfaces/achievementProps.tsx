import { tips } from "./tips"
import { item } from "./item"

interface achievementProps {
    result: tips | undefined,
    items: item[]
}

export type { achievementProps }