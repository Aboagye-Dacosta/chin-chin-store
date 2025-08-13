import { Flex } from "./flex";
import { Label } from "./label";

interface FormRowProps {
  children: React.ReactNode;
  htmlFor?: string;
  label?: string;
  error?: string;
}

export const FormRow = ({ children, htmlFor, label, error }: FormRowProps) => {
  return (
    <Flex direction="col" gap="lg" align="start" className="w-full">
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error && <p className="text-red-500">{error}</p>}
    </Flex>
  );
};
