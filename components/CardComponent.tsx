import { Card, CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CardComponent({
  title,
  cardAction,
  numberData,
  description,
  loading,
}: {
  title: string;
  cardAction?: React.ReactNode;
  numberData?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card
      className="
    flex h-full flex-col min-w-0
    border border-border
    transition-all duration-300 ease-in-out
    hover:-translate-y-1 hover:scale-[1.01]
    hover:shadow-[0_8px_20px_rgb(0,0,0,0.4)]
    hover:ring-1 hover:ring-primary/40
    hover:border-primary/60
    hover:cursor-pointer
    focus-visible:outline-none
    focus-visible:ring-2 
    focus-visible:ring-primary/50
  "
    >
      <CardContent className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          {cardAction ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm text-muted-foreground truncate">
                  {title || "Default Title"}
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">{title || "Default Title"}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Label className="text-sm text-muted-foreground truncate">
              {title || "Default Title"}
            </Label>
          )}

          {cardAction && !loading && (
            <div className="flex-shrink-0">{cardAction}</div>
          )}
        </div>

        {/* Main number */}
        {!loading && (
          <p className="text-2xl md:text-3xl font-semibold truncate">
            {numberData || "0"}
          </p>
        )}
      </CardContent>

      {/* Footer */}
      {description && !loading && (
        <CardFooter className="mt-auto pt-0 md:min-h-[36px] flex items-start">
          <p className="text-sm text-muted-foreground line-clamp-2 p-0">
            {description}
          </p>
        </CardFooter>
      )}

      {loading && (
        <div className="flex items-center justify-center h-[90px]">
          <Spinner className="text-muted-foreground h-6 w-6" />
        </div>
      )}
    </Card>
  );
}
