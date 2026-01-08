export declare function ApiCommonErrorResponses(options?: {
    badRequest?: boolean;
    unauthorized?: boolean;
    forbidden?: boolean;
    notFound?: boolean;
    conflict?: boolean;
    internalServerError?: boolean;
}): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function ApiAuthErrorResponses(): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function ApiPublicErrorResponses(): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
