import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { ResultHero } from "../../components/ResultHero";
import { Divider, Row } from "../../components/Row";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { ShareButton } from "../../components/ShareButton";
import { Stepper } from "../../components/Stepper";
import { ToggleRow } from "../../components/ToggleRow";
import { useAppStore } from "../../store/useAppStore";
import { CURRENCY_SYMBOL, REGION } from "../../utils/currency";
import { formatMoney, formatSmart } from "../../utils/format";
import { shareResult } from "../../utils/share";

const KM_PER_MILE = 1.609344;
const L_PER_GAL_US = 3.785411784;
const L_PER_GAL_UK = 4.54609;

const IS_US = REGION === "US";
const IS_UK = REGION === "GB";

const DEFAULTS = {
  distance: "100",
  distUnit: IS_US || IS_UK ? "mi" : "km",
  eff: IS_US ? "28" : IS_UK ? "45" : "12",
  effUnit: IS_US ? "mpgus" : IS_UK ? "mpguk" : "kml",
  price: "",
  priceUnit: IS_US ? "gal" : "l",
  roundTrip: "0",
  people: "1",
};

const EFF_LABEL: Record<string, string> = {
  kml: "km/L",
  l100: "L/100 km",
  mpgus: "MPG (US)",
  mpguk: "MPG (UK)",
};

function calculate(v: typeof DEFAULTS) {
  const distance = Number(v.distance);
  const eff = Number(v.eff);
  const price = Number(v.price);
  const people = Math.max(1, Math.floor(Number(v.people) || 1));
  if (!(distance > 0) || !(eff > 0) || !(price > 0)) return null;

  let km = v.distUnit === "mi" ? distance * KM_PER_MILE : distance;
  if (v.roundTrip === "1") km *= 2;
  const miles = km / KM_PER_MILE;

  let litres: number;
  switch (v.effUnit) {
    case "l100":
      litres = (km * eff) / 100;
      break;
    case "mpgus":
      litres = (miles / eff) * L_PER_GAL_US;
      break;
    case "mpguk":
      litres = (miles / eff) * L_PER_GAL_UK;
      break;
    default:
      litres = km / eff;
  }

  const pricePerLitre = v.priceUnit === "gal" ? price / L_PER_GAL_US : price;
  const cost = litres * pricePerLitre;
  const distTotal = v.distUnit === "mi" ? miles : km;

  return {
    cost,
    perPerson: cost / people,
    people,
    litres,
    gallons: litres / L_PER_GAL_US,
    distTotal,
    costPerDist: cost / distTotal,
  };
}

export default function FuelCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.fuel);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("fuel", field, v);
  const symbol = CURRENCY_SYMBOL;
  const distUnit = values.distUnit === "mi" ? "mi" : "km";
  const people = Math.max(1, Math.floor(Number(values.people) || 1));

  const r = useMemo(() => calculate(values), [JSON.stringify(values)]);

  const fuelText =
    values.priceUnit === "gal"
      ? `${formatSmart(r?.gallons ?? 0)} gallons`
      : `${formatSmart(r?.litres ?? 0)} litres`;

  const note = r
    ? `You'll need about ${fuelText} of fuel for ${formatSmart(r.distTotal, 1)} ${distUnit}${
        values.roundTrip === "1" ? " (round trip)" : ""
      }.`
    : "";

  const onShare = () => {
    if (!r) return;
    shareResult("Trip fuel cost", [
      `Distance: ${formatSmart(r.distTotal, 1)} ${distUnit}${
        values.roundTrip === "1" ? " (round trip)" : ""
      }`,
      `Fuel efficiency: ${values.eff} ${EFF_LABEL[values.effUnit]}`,
      `Fuel needed: ${fuelText}`,
      `Total cost: ${formatMoney(r.cost, symbol)}`,
      ...(r.people > 1
        ? [`Per person (${r.people}): ${formatMoney(r.perPerson, symbol)}`]
        : []),
    ]);
  };

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        <ScreenHeader
          title="Fuel & Trip Cost"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Card>
          <NumberField
            label="Distance"
            value={values.distance}
            onChange={set("distance")}
            suffix={distUnit}
            labelRight={
              <Segmented
                value={distUnit}
                onChange={set("distUnit")}
                options={[
                  { label: "km", value: "km" },
                  { label: "miles", value: "mi" },
                ]}
              />
            }
          />

          <Text className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Fuel efficiency
          </Text>
          <Segmented
            full
            value={values.effUnit}
            onChange={set("effUnit")}
            options={[
              { label: "km/L", value: "kml" },
              { label: "L/100km", value: "l100" },
              { label: "MPG US", value: "mpgus" },
              { label: "MPG UK", value: "mpguk" },
            ]}
          />
          <View className="mt-3">
            <NumberField
              label={`Your vehicle's ${EFF_LABEL[values.effUnit]}`}
              value={values.eff}
              onChange={set("eff")}
              suffix={EFF_LABEL[values.effUnit]}
            />
          </View>

          <NumberField
            label="Fuel price"
            value={values.price}
            onChange={set("price")}
            prefix={symbol}
            suffix={values.priceUnit === "gal" ? "/ gal" : "/ L"}
            labelRight={
              <Segmented
                value={values.priceUnit}
                onChange={set("priceUnit")}
                options={[
                  { label: "Per litre", value: "l" },
                  { label: "Per gallon", value: "gal" },
                ]}
              />
            }
          />

          <Stepper
            label="Split between"
            value={people}
            onChange={(v) => set("people")(String(v))}
            min={1}
            max={20}
            unit={people === 1 ? "person" : "people"}
          />

          <ToggleRow
            label="Round trip"
            description="Double the distance for the return journey"
            value={values.roundTrip === "1"}
            onChange={(v) => set("roundTrip")(v ? "1" : "0")}
          />
        </Card>

        {r ? (
          <>
            <ResultHero
              label={r.people > 1 ? "Each person pays" : "Total fuel cost"}
              value={formatMoney(r.people > 1 ? r.perPerson : r.cost, symbol)}
              note={note}
            />
            <Card className="mt-4">
              <Row
                label="Total distance"
                value={`${formatSmart(r.distTotal, 1)} ${distUnit}`}
              />
              <Row label="Fuel needed" value={fuelText} />
              <Row
                label={`Cost per ${distUnit === "mi" ? "mile" : "km"}`}
                value={formatMoney(r.costPerDist, symbol)}
              />
              <Divider />
              <Row
                label="Total cost"
                value={formatMoney(r.cost, symbol)}
                bold
              />
              {r.people > 1 && (
                <Row
                  label={`Per person (${r.people})`}
                  value={formatMoney(r.perPerson, symbol)}
                  highlight
                />
              )}
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter the distance, your vehicle's fuel efficiency and the fuel
              price.
            </Text>
          </Card>
        )}

        <InfoTip title="Where do I find my fuel efficiency?">
          Check your car's trip computer or manual. To measure it yourself: fill
          the tank, reset the trip meter, drive normally, then refill. Divide
          the distance driven by the litres you refilled to get km/L. City
          driving, traffic and air conditioning usually use more fuel than
          highway driving.
        </InfoTip>
      </ScrollView>
    </View>
  );
}
