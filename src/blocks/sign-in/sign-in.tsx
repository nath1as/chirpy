import { signIn } from 'next-auth/react';
import * as React from 'react';
import tw, { css } from 'twin.macro';

import { Alert } from '$/components/alert';
import { Button } from '$/components/button';
import { Heading } from '$/components/heading';
import { Link } from '$/components/link';
import { Logo } from '$/components/logo';
import { Text } from '$/components/text';
import { TextField } from '$/components/text-field';
import { useForm } from '$/hooks/use-form';
import { SIGN_IN_ERRORS } from '$/strings';
import { getHostEnv } from '$/utilities/env';

import { authOptions } from './data-source';

export type SignInProps = React.PropsWithChildren<{
  title: string;
  subtitle?: React.ReactNode;
}>;

type SignInErrorKeys = keyof typeof SIGN_IN_ERRORS;

export function SignIn({ title, subtitle }: SignInProps): JSX.Element {
  const [errorType, setErrorType] = React.useState<SignInErrorKeys | undefined>();
  React.useEffect(() => {
    const error = new URLSearchParams(location.search).get('error') as SignInErrorKeys | null;
    if (error) {
      setErrorType(error);
    }
  }, []);
  const [isProd, setIsProd] = React.useState(true);
  React.useEffect(() => {
    if (getHostEnv() !== 'prod') {
      setIsProd(false);
    }
  }, []);
  const error = errorType && (SIGN_IN_ERRORS[errorType] ?? SIGN_IN_ERRORS.Default);
  return (
    <div tw="flex flex-row h-full" className="full-bleed">
      <div tw="flex-1 flex flex-col justify-center items-center">
        <div tw="py-7 w-full sm:(mx-2 w-64) md:(w-96)">
          <div tw="pb-8">
            <Logo size="lg" hideSpacing />
          </div>
          <div tw="space-y-2">
            <Heading as="h2" tw="font-black mt-5">
              {title}
            </Heading>
            {subtitle}
          </div>
          <div tw="space-y-2 mt-8">
            {error && <Alert type="warn">{error}</Alert>}
            {authOptions.map((option) => (
              <Button
                key={option.name}
                onClick={() =>
                  signIn(option.name.toLowerCase(), {
                    callbackUrl: `${location.origin}/auth/redirecting`,
                  })
                }
                tw="w-full px-0 md:(justify-start pl-20)"
                size="lg"
              >
                <option.icon />
                <span tw="ml-2 text-left">Sign in with {option.name}</span>
              </Button>
            ))}
          </div>
          {!isProd && <EmailSignIn />}
          <Text tw="py-3" size="sm" variant="secondary">
            By clicking the buttons above, you acknowledge that you have read and understood, and
            agree to Chirpy
            {`'s `}
            <Link href="/terms-of-service">Terms of Service</Link> and{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </Text>
          {!isProd && <CredentialsSignInForm />}
        </div>
      </div>
      <div css={[tw`flex-1 hidden sm:block`, bannerStyle]}></div>
    </div>
  );
}

function EmailSignIn(): JSX.Element {
  const [email, setEmail] = React.useState('');
  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
  };
  const handleSubmit = () => {
    signIn('email', {
      callbackUrl: `${location.origin}/auth/redirecting`,
      email,
    });
  };
  return (
    <div>
      <TextField name="Email" type="text" label="Email" onChange={handleEmailChange} tw="w-full" />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

function CredentialsSignInForm(): JSX.Element {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleClickSubmit = handleSubmit<React.FormEvent<HTMLFormElement>>(
    async (fields, event) => {
      event.preventDefault();
      await signIn('credentials', {
        // redirect: false,
        callbackUrl: '/dashboard',
        ...fields,
      });
    },
  );
  return (
    <form onSubmit={handleClickSubmit}>
      <TextField {...register('username')} type="text" label="Username" tw="w-full" />
      <TextField {...register('password')} type="password" label="Password" tw="w-full" />
      <Button type="submit" tw="w-full">
        Submit
      </Button>
    </form>
  );
}

const bannerStyle = css`
  width: 100%;
  height: 100vh;
  min-height: 200px;
  background: url('/images/sign-in/banner.jpg') center no-repeat;
  background-size: cover;
`;
