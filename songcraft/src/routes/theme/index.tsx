import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Card,
  Flex,
  Text,
  Heading,
  Separator,
  Badge,
  Switch,
  Slider,
  Select,
  TextField,
  TextArea,
  Checkbox,
  ThemePanel,
  Grid,
  Box,
  Container,
} from "@radix-ui/themes";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Label from "@radix-ui/react-label";
import { useState } from "react";
import { RadixThemeIntegrationDemo } from "@/components/RadixThemeIntegrationDemo";
import { ThemeInfo } from "@/components/ThemeInfo";

export const Route = createFileRoute("/theme/")({
  component: ThemePage,
});

function ThemePage() {
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [selectValue, setSelectValue] = useState("option1");
  const [textValue, setTextValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");

  return (
    <Container size="4" py="6">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Box>
          <Heading size="8" mb="2">
            Radix UI Theme Showcase
          </Heading>
          <Text size="3" color="gray">
            Explore all Radix UI components with live theming controls
          </Text>
        </Box>

        <Separator size="4" />

        {/* Theme Panel */}
        <Card size="3">
          <Flex direction="column" gap="3">
            <Heading size="5">Theme Customization</Heading>
            <Text size="3" color="gray">
              Use the panel below to customize the theme in real-time. All
              buttons should change color when you select different accent
              colors.
            </Text>
            <ThemePanel />
            <ThemeInfo />
          </Flex>
        </Card>

        {/* Typography */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Typography</Heading>
            <Flex direction="column" gap="2">
              <Heading size="8">Heading Size 8</Heading>
              <Heading size="7">Heading Size 7</Heading>
              <Heading size="6">Heading Size 6</Heading>
              <Heading size="5">Heading Size 5</Heading>
              <Heading size="4">Heading Size 4</Heading>
              <Heading size="3">Heading Size 3</Heading>
              <Heading size="2">Heading Size 2</Heading>
              <Heading size="1">Heading Size 1</Heading>
            </Flex>
            <Flex direction="column" gap="2">
              <Text size="5">Text Size 5</Text>
              <Text size="4">Text Size 4</Text>
              <Text size="3">Text Size 3</Text>
              <Text size="2">Text Size 2</Text>
              <Text size="1">Text Size 1</Text>
            </Flex>
            <Flex direction="column" gap="2">
              <Text size="3" color="gray">
                Gray text
              </Text>
              <Text size="3" color="blue">
                Blue text
              </Text>
              <Text size="3" color="green">
                Green text
              </Text>
              <Text size="3" color="red">
                Red text
              </Text>
              <Text size="3" color="orange">
                Orange text
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Buttons */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Buttons</Heading>
            <Grid columns="3" gap="3">
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Solid
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button variant="solid">Primary</Button>
                  <Button variant="solid" color="red">
                    Destructive
                  </Button>
                  <Button variant="solid" color="green">
                    Success
                  </Button>
                  <Button variant="solid" color="orange">
                    Warning
                  </Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Soft
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button variant="soft">Primary</Button>
                  <Button variant="soft" color="red">
                    Destructive
                  </Button>
                  <Button variant="soft" color="green">
                    Success
                  </Button>
                  <Button variant="soft" color="orange">
                    Warning
                  </Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Outline
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button variant="outline">Primary</Button>
                  <Button variant="outline" color="red">
                    Destructive
                  </Button>
                  <Button variant="outline" color="green">
                    Success
                  </Button>
                  <Button variant="outline" color="orange">
                    Warning
                  </Button>
                </Flex>
              </Flex>
            </Grid>
            <Grid columns="3" gap="3">
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Ghost
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button variant="ghost">Primary</Button>
                  <Button variant="ghost" color="red">
                    Destructive
                  </Button>
                  <Button variant="ghost" color="green">
                    Success
                  </Button>
                  <Button variant="ghost" color="orange">
                    Warning
                  </Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Sizes
                </Text>
                <Flex gap="2" wrap="wrap" align="center">
                  <Button size="1">Size 1</Button>
                  <Button size="2">Size 2</Button>
                  <Button size="3">Size 3</Button>
                  <Button size="4">Size 4</Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  States
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </Flex>
              </Flex>
            </Grid>
          </Flex>
        </Card>

        {/* Form Controls */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Form Controls</Heading>
            <Grid columns="2" gap="4">
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Text Input
                </Text>
                <TextField.Root>
                  <TextField.Slot>
                    <input
                      placeholder="Enter text..."
                      value={textValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTextValue(e.target.value)
                      }
                    />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Text Area
                </Text>
                <TextArea
                  placeholder="Enter longer text..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Select
                </Text>
                <Select.Root value={selectValue} onValueChange={setSelectValue}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="option1">Option 1</Select.Item>
                    <Select.Item value="option2">Option 2</Select.Item>
                    <Select.Item value="option3">Option 3</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Slider
                </Text>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
                <Text size="2" color="gray">
                  Value: {sliderValue[0]}
                </Text>
              </Flex>
            </Grid>
          </Flex>
        </Card>

        {/* Interactive Controls */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Interactive Controls</Heading>
            <Grid columns="2" gap="4">
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Switch
                </Text>
                <Flex align="center" gap="2">
                  <Switch
                    checked={switchValue}
                    onCheckedChange={setSwitchValue}
                  />
                  <Text size="2">{switchValue ? "On" : "Off"}</Text>
                </Flex>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Checkbox
                </Text>
                <Flex align="center" gap="2">
                  <Checkbox
                    checked={checkboxValue}
                    onCheckedChange={(checked) =>
                      setCheckboxValue(checked === true)
                    }
                  />
                  <Text size="2">
                    {checkboxValue ? "Checked" : "Unchecked"}
                  </Text>
                </Flex>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Radio Group
                </Text>
                <RadioGroup.Root
                  value={radioValue}
                  onValueChange={setRadioValue}
                >
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <RadioGroup.Item value="option1" id="r1" />
                      <Label.Root htmlFor="r1">Option 1</Label.Root>
                    </Flex>
                    <Flex align="center" gap="2">
                      <RadioGroup.Item value="option2" id="r2" />
                      <Label.Root htmlFor="r2">Option 2</Label.Root>
                    </Flex>
                    <Flex align="center" gap="2">
                      <RadioGroup.Item value="option3" id="r3" />
                      <Label.Root htmlFor="r3">Option 3</Label.Root>
                    </Flex>
                  </Flex>
                </RadioGroup.Root>
              </Flex>
              <Flex direction="column" gap="3">
                <Text size="2" weight="bold">
                  Badges
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Badge color="blue">Blue</Badge>
                  <Badge color="green">Green</Badge>
                  <Badge color="red">Red</Badge>
                  <Badge color="orange">Orange</Badge>
                  <Badge color="gray">Gray</Badge>
                </Flex>
              </Flex>
            </Grid>
          </Flex>
        </Card>

        {/* Cards and Layout */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Cards and Layout</Heading>
            <Grid columns="3" gap="3">
              <Card size="1">
                <Flex direction="column" gap="2">
                  <Text size="2" weight="bold">
                    Card Size 1
                  </Text>
                  <Text size="1" color="gray">
                    Small card content
                  </Text>
                </Flex>
              </Card>
              <Card size="2">
                <Flex direction="column" gap="2">
                  <Text size="3" weight="bold">
                    Card Size 2
                  </Text>
                  <Text size="2" color="gray">
                    Medium card content
                  </Text>
                </Flex>
              </Card>
              <Card size="3">
                <Flex direction="column" gap="2">
                  <Text size="4" weight="bold">
                    Card Size 3
                  </Text>
                  <Text size="3" color="gray">
                    Large card content
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Current Values Display */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5">Current Form Values</Heading>
            <Grid columns="2" gap="3">
              <Box>
                <Text size="2" weight="bold">
                  Form State:
                </Text>
                <Flex direction="column" gap="1" mt="2">
                  <Text size="1">Switch: {switchValue ? "On" : "Off"}</Text>
                  <Text size="1">Slider: {sliderValue[0]}</Text>
                  <Text size="1">Select: {selectValue}</Text>
                  <Text size="1">Text: "{textValue}"</Text>
                  <Text size="1">Textarea: "{textareaValue}"</Text>
                  <Text size="1">
                    Checkbox: {checkboxValue ? "Checked" : "Unchecked"}
                  </Text>
                  <Text size="1">Radio: {radioValue}</Text>
                </Flex>
              </Box>
              <Box>
                <Text size="2" weight="bold">
                  Theme Info:
                </Text>
                <Flex direction="column" gap="1" mt="2">
                  <Text size="1">All components inherit theme colors</Text>
                  <Text size="1">Interactive states are themed</Text>
                  <Text size="1">Typography scales with theme</Text>
                  <Text size="1">Spacing follows theme tokens</Text>
                </Flex>
              </Box>
            </Grid>
          </Flex>
        </Card>

        {/* Radix Theme Integration Examples */}
        <Card size="3">
          <RadixThemeIntegrationDemo />
        </Card>
      </Flex>
    </Container>
  );
}
