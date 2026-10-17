/** An optional rest string arg. ForgeScript 2.3.0's `Arg.restString` makes every rest arg required. */
export declare function optionalRest(name: string, desc: string): {
    required: boolean;
    name: string;
    description: string;
    type: import("@tryforge/forgescript").ArgType.String;
    enum?: import("@tryforge/forgescript").EnumLike | undefined;
    pointer?: number;
    pointerProperty?: string;
    condition?: boolean;
    delimiter?: string;
    check?: ((i: string) => boolean) | undefined;
    rest: true;
};
//# sourceMappingURL=args.d.ts.map