import AutoHeight from "embla-carousel-auto-height"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


interface PostMediaProps {
  media: string[] | null;
}

export default function PostMedia({ media }: PostMediaProps) {
    if (!media || media.length === 0) return null;

    return (
        <Carousel className="max-w-[10rem] sm:max-w-lg" plugins={[
            AutoHeight({active : true})
        ]}>
        <CarouselContent>
            {media.map((m, index) => (
            <CarouselItem key={index}>
            <img
                src={m}
                className="w-full aspect-square object-cover rounded-lg"
            />
            </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        </Carousel>
    )
}