import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON_KEY,
  getCategoryIcon,
  normalizeCategoryColor,
  resolveCategoryIconKey,
} from "@/components/category-icon-registry";
import CategoryBadge from "@/components/category-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryStylePickerProps = {
  icon?: string;
  color?: string;
  onIconChange: (value: string) => void;
  onColorChange: (value: string) => void;
  previewLabel?: string;
};

export default function CategoryStylePicker({
  icon,
  color,
  onIconChange,
  onColorChange,
  previewLabel = "Preview",
}: CategoryStylePickerProps) {
  const iconValue = resolveCategoryIconKey(icon || DEFAULT_CATEGORY_ICON_KEY);
  const colorValue = normalizeCategoryColor(color, DEFAULT_CATEGORY_COLOR);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Icon</Label>
          <Select value={iconValue} onValueChange={onIconChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ICON_OPTIONS.map((option) => {
                const OptionIcon = getCategoryIcon(option.value);
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <OptionIcon className="h-4 w-4" />
                      {option.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={colorValue}
              onChange={(event) => onColorChange(event.target.value)}
              className="h-10 w-12 p-1"
            />
            <Input
              type="text"
              value={color || ""}
              placeholder={DEFAULT_CATEGORY_COLOR}
              onChange={(event) => onColorChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mt-8">
        <CategoryBadge
          name={previewLabel}
          icon={iconValue}
          color={colorValue}
          className="text-md border border-dashed rounded-md  p-4 w-fit mx-auto justify-center"
        />
      </div>
    </div>
  );
}
