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
  icon,
  accentColor,
}: {
  title: string;
  cardAction?: React.ReactNode;
  numberData?: string;
  description?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <Card
      className="
    relative flex h-full flex-col min-w-0 overflow-hidden
    transition-all duration-300 ease-in-out
    hover:shadow-[0_8px_24px_rgb(0,0,0,0.35)] hover:-translate-y-0.5
  "
    >
      {/* Accent border stripe */}
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <CardContent className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-muted/60 text-muted-foreground">
                {icon}
              </div>
            )}
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
          </div>

          {cardAction && !loading && (
            <div className="flex-shrink-0">{cardAction}</div>
          )}
        </div>

        {/* Main number */}
        {!loading && (
          <p className="text-2xl md:text-3xl font-semibold truncate" style={{ fontFeatureSettings: '"tnum"' }}>
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
