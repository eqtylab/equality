import { useState, useMemo } from "react";
import tokens from "../../../../tokens/equality-tokens.json";
import { SearchBar, Heading } from "@eqtylab/equality";

interface ColorValue {
  hex: string;
  components: number[];
  colorSpace: string;
}

interface Color {
  name: string;
  hex: string;
  components: number[];
  colorSpace: string;
}

type TokenData = typeof tokens;

const ColorTokensDemo = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedColors = useMemo(() => {
    const groups: Record<string, Record<string, Color[]>> = {};

    Object.keys(tokens).forEach((theme) => {
      groups[theme] = {};
      const themeColors = (tokens as TokenData)[theme as keyof TokenData];
      const colorObj = themeColors.color || themeColors;

      function processColorObject(obj: any, prefix = "", themeName: string) {
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          const fullPath = prefix ? `${prefix}.${key}` : key;

          if (value.$type === "color" && value.$value) {
            const colorValue = value.$value as ColorValue;

            let groupName: string;
            if (!prefix) {
              groupName = "Single Colors";
            } else {
              const firstPart = prefix.split(".")[0];
              groupName =
                firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
            }

            if (!groups[themeName][groupName]) {
              groups[themeName][groupName] = [];
            }

            groups[themeName][groupName].push({
              name: fullPath,
              hex: colorValue.hex || "",
              components: colorValue.components,
              colorSpace: colorValue.colorSpace,
            });
          } else if (
            typeof value === "object" &&
            value !== null &&
            !value.$type
          ) {
            const keys = Object.keys(value);
            const isPalette = keys.every((k) => {
              const numKey = parseInt(k, 10);
              return !isNaN(numKey) && value[k].$type === "color";
            });

            if (isPalette) {
              const paletteName = key.charAt(0).toUpperCase() + key.slice(1);
              if (!groups[themeName][paletteName]) {
                groups[themeName][paletteName] = [];
              }

              keys
                .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                .forEach((shade) => {
                  const shadeValue = value[shade];
                  if (shadeValue.$type === "color" && shadeValue.$value) {
                    const colorValue = shadeValue.$value as ColorValue;
                    groups[themeName][paletteName].push({
                      name: `${key}-${shade}`,
                      hex: colorValue.hex || "",
                      components: colorValue.components,
                      colorSpace: colorValue.colorSpace,
                    });
                  }
                });
            } else {
              processColorObject(value, fullPath, themeName);
            }
          }
        });
      }

      processColorObject(colorObj, "", theme);
    });

    return groups;
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedColors;

    const filtered: Record<string, Record<string, Color[]>> = {};

    Object.keys(groupedColors).forEach((theme) => {
      filtered[theme] = {};
      Object.keys(groupedColors[theme]).forEach((groupName) => {
        const filteredColors = groupedColors[theme][groupName].filter((color) =>
          color.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        if (filteredColors.length > 0) {
          filtered[theme][groupName] = filteredColors;
        }
      });
    });

    return filtered;
  }, [groupedColors, searchTerm]);

  const getColorStyle = (color: Color) => {
    const [r, g, b] = color.components;
    if (color.colorSpace && color.components?.length > 0) {
      return {
        backgroundColor: `color(${color.colorSpace || "display-p3"} ${r} ${g} ${b})`,
      };
    }
    return { backgroundColor: color.hex };
  };

  return (
    <div className="w-full space-y-10">
      <SearchBar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />

      {Object.keys(filteredGroups).map((theme) => {
        const themeGroups = filteredGroups[theme];
        const hasVisibleGroups = Object.keys(themeGroups).length > 0;

        if (!hasVisibleGroups) return null;

        return (
          <div
            key={theme}
            className="space-y-10"
            data-theme={theme.toLowerCase()}
          >
            <Heading as="h2" className="border-border border-b pb-2">
              {theme} Theme
            </Heading>

            {Object.keys(themeGroups)
              .sort()
              .map((groupName) => {
                const colors = themeGroups[groupName];
                if (colors.length === 0) return null;

                return (
                  <div
                    key={groupName}
                    className="space-y-4"
                    data-group={groupName.toLowerCase()}
                  >
                    <Heading as="h3">{groupName}</Heading>
                    <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                      {colors.map((color) => (
                        <div
                          key={color.name}
                          className="bg-background border-border overflow-hidden rounded-lg border"
                          data-name={color.name.toLowerCase()}
                        >
                          <div
                            className="h-[120px] w-full"
                            style={getColorStyle(color)}
                          />
                          <div className="space-y-2 p-2">
                            <Heading as="h5">
                              {color.name.replace(/\./g, "-")}
                            </Heading>
                            <Heading as="h6">{color.hex}</Heading>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}

      {Object.keys(filteredGroups).every(
        (theme) => Object.keys(filteredGroups[theme]).length === 0,
      ) && (
        <div className="py-8 text-center text-gray-500">
          No colors found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ColorTokensDemo;
