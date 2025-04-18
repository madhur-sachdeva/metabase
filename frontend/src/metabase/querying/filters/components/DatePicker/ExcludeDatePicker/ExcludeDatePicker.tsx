import { useMemo, useState } from "react";
import { t } from "ttag";

import type {
  DatePickerExtractionUnit,
  DatePickerOperator,
  DatePickerUnit,
  ExcludeDatePickerOperator,
  ExcludeDatePickerValue,
} from "metabase/querying/filters/types";
import type { PopoverBackButtonProps } from "metabase/ui";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  PopoverBackButton,
  Stack,
  Text,
} from "metabase/ui";

import { MIN_WIDTH } from "../constants";

import type { ExcludeValueOption } from "./types";
import {
  findExcludeUnitOption,
  getExcludeOperatorOptions,
  getExcludeOperatorValue,
  getExcludeUnitOptions,
  getExcludeUnitValue,
  getExcludeValueOptionGroups,
} from "./utils";

export interface ExcludeDatePickerProps {
  value?: ExcludeDatePickerValue;
  availableOperators: DatePickerOperator[];
  availableUnits: DatePickerUnit[];
  submitButtonLabel: string;
  onChange: (value: ExcludeDatePickerValue) => void;
  onBack: () => void;
}

export function ExcludeDatePicker({
  value,
  availableOperators,
  availableUnits,
  submitButtonLabel,
  onChange,
  onBack,
}: ExcludeDatePickerProps) {
  const [unit, setUnit] = useState(value?.unit);
  const [values, setValues] = useState(value?.values ?? []);

  const handleSelectUnit = (unit: DatePickerExtractionUnit) => {
    setUnit(unit);
    setValues([]);
  };

  const handleBack = () => {
    setUnit(undefined);
  };

  return unit ? (
    <ExcludeValuePicker
      unit={unit}
      initialValues={values}
      submitButtonLabel={submitButtonLabel}
      onChange={onChange}
      onBack={handleBack}
    />
  ) : (
    <ExcludeOptionPicker
      value={value}
      availableOperators={availableOperators}
      availableUnits={availableUnits}
      onChange={onChange}
      onSelectUnit={handleSelectUnit}
      onBack={onBack}
    />
  );
}

interface ExcludeOptionPickerProps {
  value: ExcludeDatePickerValue | undefined;
  availableOperators: DatePickerOperator[];
  availableUnits: DatePickerUnit[];
  onChange: (value: ExcludeDatePickerValue) => void;
  onSelectUnit: (unit: DatePickerExtractionUnit) => void;
  onBack: () => void;
}

export function ExcludeOptionPicker({
  value,
  availableOperators,
  availableUnits,
  onChange,
  onSelectUnit,
  onBack,
}: ExcludeOptionPickerProps) {
  const unitOptions = useMemo(() => {
    return getExcludeUnitOptions(availableOperators, availableUnits);
  }, [availableOperators, availableUnits]);

  const operatorOptions = useMemo(() => {
    return getExcludeOperatorOptions(availableOperators);
  }, [availableOperators]);

  const handleChange = (operator: ExcludeDatePickerOperator) => {
    onChange(getExcludeOperatorValue(operator));
  };

  return (
    <Box miw={MIN_WIDTH}>
      <BackButton onClick={onBack}>{t`Exclude…`}</BackButton>
      <Divider />
      <Box p="sm">
        {unitOptions.map((option, index) => (
          <Button
            key={index}
            c="var(--mb-color-text-primary)"
            display="block"
            variant="subtle"
            onClick={() => onSelectUnit(option.unit)}
          >
            {option.label}
          </Button>
        ))}
        {unitOptions.length > 0 && operatorOptions.length > 0 && (
          <Divider mx="md" my="sm" />
        )}
        {operatorOptions.map((option, index) => (
          <Button
            key={index}
            c={
              option.operator === value?.operator
                ? "var(--mb-color-text-brand)"
                : "var(--mb-color-text-primary)"
            }
            display="block"
            variant="subtle"
            onClick={() => handleChange(option.operator)}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

interface ExcludeValuePickerProps {
  unit: DatePickerExtractionUnit;
  initialValues: number[];
  submitButtonLabel: string;
  onChange: (value: ExcludeDatePickerValue) => void;
  onBack: () => void;
}

function ExcludeValuePicker({
  unit,
  initialValues,
  submitButtonLabel,
  onChange,
  onBack,
}: ExcludeValuePickerProps) {
  const [values, setValues] = useState(initialValues);
  const option = useMemo(() => findExcludeUnitOption(unit), [unit]);
  const groups = useMemo(() => getExcludeValueOptionGroups(unit), [unit]);
  const options = groups.flat();
  const isAll = values.length === options.length;
  const isNone = values.length === 0;

  const handleToggleAll = (isChecked: boolean) => {
    if (isChecked) {
      setValues(groups.flatMap((groups) => groups.map(({ value }) => value)));
    } else {
      setValues([]);
    }
  };

  const handleToggleOption = (
    option: ExcludeValueOption,
    isChecked: boolean,
  ) => {
    if (isChecked) {
      setValues([...values, option.value]);
    } else {
      setValues(values.filter((value) => value !== option.value));
    }
  };

  const handleSubmit = () => {
    onChange(getExcludeUnitValue(unit, values));
  };

  return (
    <Box miw={MIN_WIDTH}>
      <BackButton onClick={onBack}>{option?.label}</BackButton>
      <Divider />
      <Stack p="md">
        <Checkbox
          checked={isAll}
          label={<Text c="text-secondary">{t`Select all`}</Text>}
          onChange={(event) => handleToggleAll(event.target.checked)}
        />
        <Divider />
        <Group>
          {groups.map((group, groupIndex) => (
            <Stack key={groupIndex}>
              {group.map((option, optionIndex) => (
                <Checkbox
                  key={optionIndex}
                  label={option.label}
                  checked={values.includes(option.value)}
                  onChange={(event) =>
                    handleToggleOption(option, event.target.checked)
                  }
                />
              ))}
            </Stack>
          ))}
        </Group>
      </Stack>
      <Divider />
      <Group p="sm" justify="flex-end">
        <Button variant="filled" disabled={isNone} onClick={handleSubmit}>
          {submitButtonLabel}
        </Button>
      </Group>
    </Box>
  );
}

function BackButton(props: PopoverBackButtonProps) {
  return <PopoverBackButton px="md" py="sm" {...props} />;
}
