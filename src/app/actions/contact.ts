'use server';

import { createClient } from '@/lib/supabase/server';

interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(input: ContactFormInput) {
  const supabase = await createClient();

  if (!input.name || !input.email || !input.message) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: input.name,
        email: input.email,
        message: input.message,
      });

    if (error) {
      console.error('Contact form DB error:', error);
      return { success: false, error: 'Could not save message. Please try again later.' };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Contact form server action failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
