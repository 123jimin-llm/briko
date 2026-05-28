import type {Type} from 'arktype';

declare const __public: unique symbol;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PublicType<T, $ = {}> = Type<T, $> & {
    readonly [__public]: true;
};

export function exportType<T extends Type>(t: T) {
    return t as unknown as PublicType<T['t']>;
}
