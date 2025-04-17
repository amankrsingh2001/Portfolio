import { Mulish } from "next/font/google";
import { Crimson_Text } from "next/font/google";
import { Cormorant } from "next/font/google";

export const MulsihFont = Mulish({
    weight:['500'],
    subsets:['latin'],
    variable:'--font-mulish'
})

export const CrimsonFont = Crimson_Text({
    weight:['400'],
    subsets:['latin'],
    variable:'--font-crimson'
})

export const CormorantFont = Cormorant({
    weight:['300'],
    subsets:['latin'],
    variable:'--font-cormorant'
})