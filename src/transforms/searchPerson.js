// Searches the person table with column-aware matching
// Both names → AND, single field → exact match
import { BASE_URL, supabaseGet } from '../services/supabase';

const COLUMNS_TO_RETURN = [
  'first_name', 'last_name', 'gender', 'date_of_birth',
  'birth_place', 'national_id', 'email', 'phone_number',
];

export default async function searchPerson(attributes) {
  const firstName = (attributes.first_name || '').trim();
  const lastName = (attributes.last_name || '').trim();
  const nationalId = (attributes.national_id || '').trim();
  const phone = (attributes.phone_number || '').trim();
  const email = (attributes.email || '').trim();

  const select = COLUMNS_TO_RETURN.join(',');

  // Both names present → AND match (both must match)
  if (firstName && lastName) {
    const url =
      `${BASE_URL}/person?select=${select}` +
      `&first_name=eq.${encodeURIComponent(firstName)}` +
      `&last_name=eq.${encodeURIComponent(lastName)}`;
    return supabaseGet(url);
  }

  // Build OR conditions from available fields
  const orConds = [];
  if (firstName) orConds.push(`first_name.eq.${encodeURIComponent(firstName)}`);
  if (lastName) orConds.push(`last_name.eq.${encodeURIComponent(lastName)}`);
  if (nationalId) orConds.push(`national_id.eq.${encodeURIComponent(nationalId)}`);
  if (phone) orConds.push(`phone_number.eq.${encodeURIComponent(phone)}`);
  if (email) orConds.push(`email.eq.${encodeURIComponent(email)}`);

  if (orConds.length === 0) return [];

  if (orConds.length === 1) {
    const url = `${BASE_URL}/person?select=${select}&${orConds[0].replace('.eq.', '=eq.')}`;
    return supabaseGet(url);
  }

  const url = `${BASE_URL}/person?select=${select}&or=(${orConds.join(',')})`;
  return supabaseGet(url);
}
