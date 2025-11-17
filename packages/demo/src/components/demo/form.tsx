import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from "@eqtylab/equality";

type FormData = {
  username: string;
  email: string;
  password: string;
};

export function DefaultForm() {
  const form = useForm<FormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" variant="tertiary">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export function FormWithErrors() {
  const form = useForm<FormData>({
    defaultValues: {
      email: "invalid-email",
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" variant="tertiary">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export function FormWithDescription() {
  const form = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters long
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" variant="tertiary">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export function FormDemo({
  variant = "default",
}: {
  variant?: "default" | "with-errors" | "with-description";
}) {
  if (variant === "default") {
    return <DefaultForm />;
  }

  if (variant === "with-errors") {
    return <FormWithErrors />;
  }

  if (variant === "with-description") {
    return <FormWithDescription />;
  }

  return null;
}
