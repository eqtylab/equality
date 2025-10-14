import { useEffect, useState } from 'react';
import {
  //   AlertDialog,
  //   AlertDialogAction,
  //   AlertDialogCancel,
  //   AlertDialogContent,
  //   AlertDialogDescription,
  //   AlertDialogFooter,
  //   AlertDialogHeader,
  //   AlertDialogTitle,
  //   AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CodeBlock,
  FilledTabs,
  IconCircle,
  IconSquare,
  InfoCard,
  Input,
  Label,
  LoadingIcon,
  MetricCard,
  PanelLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadialGraph,
  SearchBar,
  SectionHeading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ShimmerSkeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@eqtylab/equality';
import {
  AlertTriangle,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Clock,
  Grid3X3,
  Layers,
  Shield,
  Tag,
  UnfoldVertical,
  UserPlus,
} from 'lucide-react';

const StyleGuide = () => {
  // Form component states
  const [checkboxStates, setCheckboxStates] = useState({
    default: false,
    checked: true,
    disabledUnchecked: false,
    disabledChecked: true,
  });

  const [switchStates, setSwitchStates] = useState({
    default: false,
    defaultChecked: true,
    small: false,
    smallChecked: true,
    disabledUnchecked: false,
    disabledChecked: true,
  });

  const [selectValue, setSelectValue] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('declarations');

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120; // Account for sticky navigation height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll for back to top button and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isTableOfContentsOpen) {
        setIsTableOfContentsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTableOfContentsOpen]);

  // Example activity log data
  const exampleActivityLogs = [
    {
      id: 1,
      projectName: 'Project Alpha',
      organizationId: 1,
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      userPicture:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      action: 'updated control configuration',
      createdAt: new Date('2024-01-15T14:30:00Z'),
    },
    {
      id: 2,
      projectName: 'Project Beta',
      organizationId: 1,
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      userPicture:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      action: 'created new policy',
      createdAt: new Date('2024-01-15T13:15:00Z'),
    },
    {
      id: 3,
      projectName: 'Project Gamma',
      organizationId: 1,
      userId: 'user3',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      userPicture:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      action: 'completed compliance audit',
      createdAt: new Date('2024-01-15T11:45:00Z'),
    },
    {
      id: 4,
      projectName: 'Project Delta',
      organizationId: 1,
      userId: 'user4',
      userName: 'Sarah Wilson',
      userEmail: 'sarah.wilson@example.com',
      userPicture:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      action: 'modified evaluation criteria',
      createdAt: new Date('2024-01-14T16:20:00Z'),
    },
    {
      id: 5,
      projectName: 'Project Epsilon',
      organizationId: 1,
      userId: 'user5',
      userName: 'David Brown',
      userEmail: 'david.brown@example.com',
      userPicture:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      action: 'initiated incident response',
      createdAt: new Date('2024-01-14T09:30:00Z'),
    },
  ];

  return (
    <div className="bg-background flex min-h-screen pb-20">
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-14">
          {/* Components */}
          <section id="components" className="space-y-10">
            <h2 className="ui-horizontal-rule-below text-2xl font-medium">Components</h2>
            {/* Buttons */}
            <section id="buttons" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Buttons</h3>
              <div className="grid grid-cols-7 gap-6">
                {/* Default */}
                <div className="flex flex-col gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="default" size="lg">
                    Default LG
                  </Button>
                  <Button variant="default" size="md">
                    Default MD
                  </Button>
                  <Button variant="default" size="sm">
                    Default SM
                  </Button>
                </div>

                {/* Outline */}
                <div className="flex flex-col gap-4">
                  <Button variant="outline">Outline</Button>
                  <Button variant="outline" size="lg">
                    Outline LG
                  </Button>
                  <Button variant="outline" size="md">
                    Outline MD
                  </Button>
                  <Button variant="outline" size="sm">
                    Outline SM
                  </Button>
                </div>

                {/* Primary */}
                <div className="flex flex-col gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="primary" size="lg">
                    Primary LG
                  </Button>
                  <Button variant="primary" size="md">
                    Primary MD
                  </Button>
                  <Button variant="primary" size="sm">
                    Primary SM
                  </Button>
                </div>

                {/* Secondary */}
                <div className="flex flex-col gap-4">
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="secondary" size="lg">
                    Secondary LG
                  </Button>{' '}
                  <Button variant="secondary" size="md">
                    Secondary MD
                  </Button>
                  <Button variant="secondary" size="sm">
                    Secondary SM
                  </Button>
                </div>

                {/* Destructive */}
                <div className="flex flex-col gap-4">
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="destructive" size="lg">
                    Destructive LG
                  </Button>
                  <Button variant="destructive" size="md">
                    Destructive MD
                  </Button>
                  <Button variant="destructive" size="sm">
                    Destructive SM
                  </Button>
                </div>

                {/* Link */}
                <div className="flex flex-col gap-4">
                  <Button variant="link">Link</Button>
                  <Button variant="link" size="lg">
                    Link LG
                  </Button>
                  <Button variant="link" size="md">
                    Link MD
                  </Button>
                  <Button variant="link" size="sm">
                    Link SM
                  </Button>
                </div>

                {/* Icon */}
                <div className="flex flex-col items-center gap-4">
                  <Button variant="icon">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="icon" size="lg">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="icon" size="md">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="icon" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Card Components */}
            <section id="cards" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Card Components</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Content-only Card */}
                <div className="space-y-2">
                  <PanelLabel label="content only (most used)" />
                  <Card>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Content-only Card</h4>
                        <p className="text-muted-foreground text-sm">
                          This card only uses CardContent without header or footer.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Only header Card */}
                <div className="space-y-2">
                  <PanelLabel label="only header" />
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Card</CardTitle>
                      <CardDescription>A simple card only with header.</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                {/* Content-only Card Interactive */}
                <div className="space-y-2">
                  <PanelLabel label="content only interactive (hover)" />
                  <Card onClick={() => console.log('Card clicked')}>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Content-only Card</h4>
                        <p className="text-muted-foreground text-sm">
                          This card only uses CardContent without header or footer.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Basic Card */}
                <div className="space-y-2">
                  <PanelLabel label="basic card" />
                  <Card>
                    <CardHeader className="border-border border-b">
                      <CardTitle>Basic Card</CardTitle>
                      <CardDescription>A simple card with header and content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This is the main content area of the card.</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Card with Footer */}
                <div className="space-y-2">
                  <PanelLabel label="with footer" />
                  <Card>
                    <CardHeader className="border-border border-b">
                      <CardTitle>Card with Footer</CardTitle>
                      <CardDescription>Includes footer actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This is the main content area of the card.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="primary" size="sm">
                        Action
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2">
                        Cancel
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Interactive Card */}
                <div className="space-y-2">
                  <PanelLabel label="interactive (hover)" />
                  <Card onClick={() => console.log('Card clicked')}>
                    <CardHeader className="border-border border-b">
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>Clickable with hover effects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This card has hover effects and is clickable.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Info Cards */}
            <section id="info-cards" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Info Cards</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="Policy Type" description="Custom" icon={Shield} />
                <InfoCard label="Version" description="v1.0.0" icon={Tag} />
                <InfoCard label="Total Controls" description="24" icon={Layers} />
                <InfoCard label="Created" description="Jul 26, 2025" icon={Calendar} />
              </div>
            </section>

            {/* Icons */}
            <section id="icons" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Icons</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <PanelLabel label="Icon Square" />
                  <IconSquare icon={Shield} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Icon Square: variant small" />
                  <IconSquare icon={Shield} size="sm" />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Icon Circle" />
                  <IconCircle icon={Shield} />
                </div>
              </div>
            </section>

            {/* Form Components */}
            <section id="forms" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Form Components</h3>

              {/* Input Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Input Components</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Default Input */}
                  <div className="space-y-2">
                    <PanelLabel label="default" />
                    <div className="space-y-2">
                      <Label htmlFor="input-default">Default Input</Label>
                      <Input
                        id="input-default"
                        type="text"
                        placeholder="Enter text here..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Disabled Input */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled" />
                    <div className="space-y-2">
                      <Label htmlFor="input-disabled">Disabled Input</Label>
                      <Input
                        id="input-disabled"
                        type="text"
                        placeholder="Disabled input"
                        disabled
                        value="Disabled value"
                      />
                    </div>
                  </div>

                  {/* Error State Input */}
                  <div className="space-y-2">
                    <PanelLabel label="error state" />
                    <div className="space-y-2">
                      <Label htmlFor="input-error">Error Input</Label>
                      <Input
                        id="input-error"
                        type="text"
                        placeholder="Invalid input"
                        className="border-red focus-visible:ring-red"
                        value="Invalid value"
                      />
                      <p className="text-red text-xs">This field is required</p>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <PanelLabel label="email type" />
                    <div className="space-y-2">
                      <Label htmlFor="input-email">Email Input</Label>
                      <Input id="input-email" type="email" placeholder="user@example.com" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <PanelLabel label="password type" />
                    <div className="space-y-2">
                      <Label htmlFor="input-password">Password Input</Label>
                      <Input id="input-password" type="password" placeholder="Enter password" />
                    </div>
                  </div>

                  {/* Number Input */}
                  <div className="space-y-2">
                    <PanelLabel label="number type" />
                    <div className="space-y-2">
                      <Label htmlFor="input-number">Number Input</Label>
                      <Input
                        id="input-number"
                        type="number"
                        placeholder="Enter number"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Textarea Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Textarea Components</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Default Textarea */}
                  <div className="space-y-2">
                    <PanelLabel label="default" />
                    <div className="space-y-2">
                      <Label htmlFor="textarea-default">Default Textarea</Label>
                      <Textarea
                        id="textarea-default"
                        placeholder="Enter your message here..."
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Disabled Textarea */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled" />
                    <div className="space-y-2">
                      <Label htmlFor="textarea-disabled">Disabled Textarea</Label>
                      <Textarea
                        id="textarea-disabled"
                        placeholder="Disabled textarea"
                        disabled
                        value="This textarea is disabled"
                      />
                    </div>
                  </div>

                  {/* Large Textarea */}
                  <div className="space-y-2">
                    <PanelLabel label="large size" />
                    <div className="space-y-2">
                      <Label htmlFor="textarea-large">Large Textarea</Label>
                      <Textarea
                        id="textarea-large"
                        placeholder="Large textarea for longer content..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Checkbox Components</h4>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {/* Default Unchecked */}
                  <div className="space-y-2">
                    <PanelLabel label="unchecked" />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="checkbox-default"
                        checked={checkboxStates.default}
                        onCheckedChange={(checked) =>
                          setCheckboxStates((prev) => ({ ...prev, default: checked as boolean }))
                        }
                      />
                      <Label htmlFor="checkbox-default">Default option</Label>
                    </div>
                  </div>

                  {/* Checked */}
                  <div className="space-y-2">
                    <PanelLabel label="checked" />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="checkbox-checked"
                        checked={checkboxStates.checked}
                        onCheckedChange={(checked) =>
                          setCheckboxStates((prev) => ({ ...prev, checked: checked as boolean }))
                        }
                      />
                      <Label htmlFor="checkbox-checked">Checked option</Label>
                    </div>
                  </div>

                  {/* Disabled Unchecked */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled unchecked" />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="checkbox-disabled-unchecked"
                        checked={checkboxStates.disabledUnchecked}
                        disabled
                      />
                      <Label htmlFor="checkbox-disabled-unchecked">Disabled unchecked</Label>
                    </div>
                  </div>

                  {/* Disabled Checked */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled checked" />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="checkbox-disabled-checked"
                        checked={checkboxStates.disabledChecked}
                        disabled
                      />
                      <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Switch Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Switch Components</h4>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {/* Default Off */}
                  <div className="space-y-2">
                    <PanelLabel label="default off" />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="switch-default"
                        checked={switchStates.default}
                        onCheckedChange={(checked) =>
                          setSwitchStates((prev) => ({ ...prev, default: checked }))
                        }
                      />
                      <Label htmlFor="switch-default">Default switch</Label>
                    </div>
                  </div>

                  {/* Default On */}
                  <div className="space-y-2">
                    <PanelLabel label="default on" />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="switch-default-checked"
                        checked={switchStates.defaultChecked}
                        onCheckedChange={(checked) =>
                          setSwitchStates((prev) => ({ ...prev, defaultChecked: checked }))
                        }
                      />
                      <Label htmlFor="switch-default-checked">Default checked</Label>
                    </div>
                  </div>

                  {/* Small Variant */}
                  <div className="space-y-2">
                    <PanelLabel label="small variant" />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="switch-small"
                        variant="small"
                        checked={switchStates.small}
                        onCheckedChange={(checked) =>
                          setSwitchStates((prev) => ({ ...prev, small: checked }))
                        }
                      />
                      <Label htmlFor="switch-small">Small switch</Label>
                    </div>
                  </div>

                  {/* Disabled Off */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled off" />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="switch-disabled-off"
                        checked={switchStates.disabledUnchecked}
                        disabled
                      />
                      <Label htmlFor="switch-disabled-off">Disabled off</Label>
                    </div>
                  </div>

                  {/* Disabled On */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled on" />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="switch-disabled-on"
                        checked={switchStates.disabledChecked}
                        disabled
                      />
                      <Label htmlFor="switch-disabled-on">Disabled on</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Select Components</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Default Select */}
                  <div className="space-y-2">
                    <PanelLabel label="default" />
                    <div className="space-y-2">
                      <Label htmlFor="select-default">Default Select</Label>
                      <Select value={selectValue} onValueChange={setSelectValue}>
                        <SelectTrigger id="select-default">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                          <SelectItem value="option4">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Disabled Select */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled" />
                    <div className="space-y-2">
                      <Label htmlFor="select-disabled">Disabled Select</Label>
                      <Select disabled>
                        <SelectTrigger id="select-disabled">
                          <SelectValue placeholder="Disabled select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Pre-selected Select */}
                  <div className="space-y-2">
                    <PanelLabel label="pre-selected" />
                    <div className="space-y-2">
                      <Label htmlFor="select-preselected">Pre-selected</Label>
                      <Select defaultValue="option2">
                        <SelectTrigger id="select-preselected">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Label Components */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Label Components</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Default Label */}
                  <div className="space-y-2">
                    <PanelLabel label="default" />
                    <div className="space-y-2">
                      <Label htmlFor="label-example">Form Label</Label>
                      <Input id="label-example" placeholder="Associated input" />
                    </div>
                  </div>

                  {/* Disabled Label */}
                  <div className="space-y-2">
                    <PanelLabel label="disabled" />
                    <div className="space-y-2">
                      <Label htmlFor="label-disabled">Disabled Label</Label>
                      <Input id="label-disabled" placeholder="Disabled input" disabled />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tables */}
            <section id="tables" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Tables</h3>

              <div className="grid grid-cols-2 gap-10">
                {/* Activity Logs Table */}
                <div className="space-y-2">
                  <PanelLabel label="Table within card component" />
                  <Card>
                    <CardContent>
                      <Table className="[&_td]:px-2 [&_td]:py-2.5 [&_th]:px-2 [&_th]:py-4">
                        <TableHeader className="text-muted-foreground text-left text-xs font-medium">
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-foreground/10 divide-y text-xs">
                          {exampleActivityLogs.slice(0, 5).map((log) => {
                            const date = log.createdAt?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                            const time = log.createdAt?.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            });

                            return (
                              <TableRow key={log.id} className="hover:bg-lilac-button">
                                <TableCell className="flex items-center gap-2">
                                  <div className="relative shrink-0">
                                    <img
                                      src={log.userPicture}
                                      alt={log.userName}
                                      className="border-foreground/10 size-6 rounded-full border object-cover"
                                    />
                                  </div>
                                  <span className="max-w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    {log.userName}
                                  </span>
                                </TableCell>
                                <TableCell className="max-w-[250px] truncate overflow-hidden whitespace-nowrap capitalize">
                                  {log.action}
                                </TableCell>
                                <TableCell className="max-w-[100px] truncate overflow-hidden whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span>
                                      {date}
                                      {time && ','}
                                    </span>
                                    <span>{time}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Table with Actions */}
                <div className="space-y-2">
                  <PanelLabel label="with actions" />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-lilac-button">
                        <TableCell className="font-medium">Alice Cooper</TableCell>
                        <TableCell>alice@example.com</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-lilac-button">
                        <TableCell className="font-medium">Charlie Brown</TableCell>
                        <TableCell>charlie@example.com</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Outside Card Table */}
                <div className="col-span-2 space-y-2">
                  <PanelLabel label="Control Table" />
                  <div className="border-border overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead className="hover:text-lilac cursor-pointer">
                            <div className="flex items-center">Control Code</div>
                          </TableHead>
                          <TableHead className="hover:text-lilac cursor-pointer">
                            <div className="flex items-center">Name</div>
                          </TableHead>
                          <TableHead className="hover:text-lilac cursor-pointer">
                            <div className="flex items-center">Description</div>
                          </TableHead>
                          <TableHead className="hover:text-lilac cursor-pointer">
                            <div className="flex items-center">Status</div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-[100px] font-medium">AC-1</TableCell>
                          <TableCell className="w-[200px]">Access Control Policy</TableCell>
                          <TableCell className="w-[300px]">
                            <div className="relative max-w-[400px]">
                              <div className="line-clamp-2 overflow-hidden">
                                The organization develops, documents, and disseminates an access
                                control policy that addresses purpose, scope, roles,
                                responsibilities, and compliance requirements.
                              </div>
                              <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                                Show more
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {/* <ControlStatusBadge status="Compliant" hasIcon /> */}
                          </TableCell>
                        </TableRow>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-[100px] font-medium">SC-8</TableCell>
                          <TableCell className="w-[200px]">Transmission Confidentiality</TableCell>
                          <TableCell className="w-[300px]">
                            <div className="relative max-w-[400px]">
                              <div className="line-clamp-2 overflow-hidden">
                                The information system protects the confidentiality of transmitted
                                information.
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {/* <ControlStatusBadge status="In Progress" hasIcon /> */}
                          </TableCell>
                        </TableRow>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-[100px] font-medium">AU-2</TableCell>
                          <TableCell className="w-[200px]">Audit Events</TableCell>
                          <TableCell className="w-[300px]">
                            <div className="relative max-w-[400px]">
                              <div className="line-clamp-2 overflow-hidden">
                                The organization determines that the information system is capable
                                of auditing events and identifies the types of events that may be of
                                interest.
                              </div>
                              <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                                Show more
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {/* <ControlStatusBadge status="Non-Compliant" hasIcon /> */}
                          </TableCell>
                        </TableRow>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-[100px] font-medium">MP-3</TableCell>
                          <TableCell className="w-[200px]">Media Marking</TableCell>
                          <TableCell className="w-[300px]">
                            <div className="relative max-w-[400px]">
                              <div className="line-clamp-2 overflow-hidden">
                                The organization marks information system media indicating the
                                distribution limitations, handling caveats, and applicable security
                                markings.
                              </div>
                              <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                                Show more
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {/* <ControlStatusBadge status="Ready For Review" hasIcon /> */}
                          </TableCell>
                        </TableRow>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-[100px] font-medium">IR-4</TableCell>
                          <TableCell className="w-[200px]">Incident Handling</TableCell>
                          <TableCell className="w-[300px]">
                            <div className="relative max-w-[400px]">
                              <div className="line-clamp-2 overflow-hidden">
                                The organization implements an incident handling capability for
                                security incidents that includes preparation, detection, analysis,
                                containment, eradication, and recovery.
                              </div>
                              <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                                Show more
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {/* <ControlStatusBadge status="Not Started" hasIcon /> */}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </section>

            {/* Filter Components */}
            <section id="filter-components" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Filter Components</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 space-y-2">
                  <PanelLabel label="Search Bar" />
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Status Filter" />
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="FAILURE">Failure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Expand/Collapse all" />
                  <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
                    <UnfoldVertical className="h-4 w-4" />
                    {isExpanded ? 'Collapse All' : 'Expand All'}
                  </Button>
                </div>
              </div>
            </section>

            {/* Metric Card */}
            <section id="metric-card" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Metric Card</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <PanelLabel label="Color variant: default" />
                  <MetricCard label="Total" value={100} icon={Layers} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Color variant: green" />
                  <MetricCard label="Success" value={20} colorVariant="green" icon={CheckCircle2} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Color variant: yellow" />
                  <MetricCard label="Pending" value={45} colorVariant="yellow" icon={Clock} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Color variant: red" />
                  <MetricCard label="Failure" value={80} colorVariant="red" icon={AlertTriangle} />
                </div>
              </div>
            </section>

            {/* Radial Graph */}
            <section id="radial-graph" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Radial Graph</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <PanelLabel label="Default" />
                  <RadialGraph className="h-52 w-max" percentage={100} />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Variant: with sub label" />
                  <RadialGraph
                    className="h-40 w-max"
                    labelClassName="text-3xl"
                    percentage={75}
                    displayLabel="75%"
                    subLabel="Compliant"
                  />
                </div>
              </div>
            </section>

            {/* Progress Bar */}
            <section id="progress-bar" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Progress Bar</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <PanelLabel label="Percentage: 0%" />
                  <Progress value={0} color="bg-lilac" />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Percentage: 75%" />
                  <Progress value={75} color="bg-lilac" />
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Percentage: 100%" />
                  <Progress value={100} color="bg-lilac" />
                </div>
              </div>
            </section>

            {/* Section Heading */}
            <section id="section-heading" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Section Heading</h3>
              <div className="space-y-2">
                <PanelLabel label="Default" />
                <SectionHeading heading="Filter Results" />
              </div>
              <div className="space-y-2">
                <PanelLabel label="With Description" />
                <SectionHeading heading="Filter Results" description="This is a description" />
              </div>
              <div className="space-y-2">
                <PanelLabel label="Variant: with right content" />
                <SectionHeading
                  heading="Filter Results"
                  renderRightContent={() => (
                    <Button variant="link" size="sm">
                      Clear Filters
                    </Button>
                  )}
                />
              </div>
              <div className="space-y-2">
                <PanelLabel label="Variant: with description and right content" />
                <SectionHeading
                  heading="Project Members"
                  description="Manage member access and roles for this project"
                  renderRightContent={() => (
                    <Button>
                      <UserPlus />
                      Add Member
                    </Button>
                  )}
                />
              </div>
            </section>

            {/* Code Block */}
            <section id="code-block" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Code Block</h3>
              <CodeBlock title="Code Block" code="console.log('Hello, world!');" />
            </section>

            {/* Tooltip */}
            <section id="tooltip" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Tooltip</h3>
              <div className="space-y-2">
                <PanelLabel label="Default" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        Hover me
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to library</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </section>

            {/* Popover */}
            <section id="popover" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Popover</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <PanelLabel label="Default" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        Click me
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <p>This is a popover</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Align: start" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        Click me
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <p>This is a popover</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <PanelLabel label="Align: end" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        Click me
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end">
                      <p>This is a popover</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <section id="tabs" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Tabs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PanelLabel label="Default" />
                  <Tabs>
                    <TabsList>
                      <TabsTrigger value="declarations">Declarations</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <PanelLabel label="With border" />
                  <Tabs className="border-border border-b">
                    <TabsList>
                      <TabsTrigger value="declarations">Declarations</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <div className="space-y-2">
                <PanelLabel label="Filled Tabs" />
                <FilledTabs
                  items={[
                    {
                      label: 'Declarations',
                      value: 'declarations',
                      icon: Shield,
                      content: (
                        <Card>
                          <CardContent>Declarations Content</CardContent>
                        </Card>
                      ),
                    },
                    {
                      label: 'Reviews',
                      value: 'reviews',
                      icon: Shield,
                      content: (
                        <Card>
                          <CardContent>Reviews Content</CardContent>
                        </Card>
                      ),
                    },
                  ]}
                  onValueChange={(value: string) => setActiveTab(value)}
                  activeTab={activeTab}
                />
              </div>
            </section>

            {/* Skeleton */}
            <section id="skeleton" className="space-y-6">
              <h3 className="border-border border-b pb-2 text-xl font-medium">Skeleton</h3>
              <div className="grid grid-cols-3 gap-4">
                <ShimmerSkeleton className="h-16" />
                <ShimmerSkeleton className="h-16" />
                <ShimmerSkeleton className="h-16" />
              </div>
            </section>
          </section>

          {/* Status Indicators */}
          <section id="status-indicators" className="space-y-4">
            <h2 className="ui-horizontal-rule-below text-2xl font-medium">Status Indicators</h2>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Toast</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        // onClick={() =>
                        //   toast({
                        //     title: 'Success',
                        //     description: 'Your changes have been saved.',
                        //     variant: 'success',
                        //   })
                        // }
                      >
                        Show Success Toast
                      </Button>
                      <PanelLabel label="Success" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        // onClick={() =>
                        //   toast({
                        //     title: 'Warning',
                        //     description: 'Please review your changes.',
                        //     variant: 'warning',
                        //   })
                        // }
                      >
                        Show Warning Toast
                      </Button>
                      <PanelLabel label="Warning" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        // onClick={() =>
                        //   toast({
                        //     title: 'Error',
                        //     description: 'Something went wrong.',
                        //     variant: 'destructive',
                        //   })
                        // }
                      >
                        Show Error Toast
                      </Button>
                      <PanelLabel label="Error" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Loading Icon</h3>
              <div className="grid grid-cols-3 gap-4">
                <LoadingIcon className="size-5" />
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* <Toaster /> */}

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          variant="primary"
          size="sm"
          onClick={scrollToTop}
          className="fixed right-8 bottom-8 z-50"
        >
          <ArrowUp className="size-4" />
          Back to Top
        </Button>
      )}
    </div>
  );
};

export default StyleGuide;
