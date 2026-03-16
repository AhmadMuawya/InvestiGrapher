/**
 * searchPerson — port of getperson.py
 *
 * Takes an entity's attributes and searches the Supabase `person` table.
 * Column-aware matching:
 *   - If both first_name AND last_name are present → AND match (both must match)
 *   - If only one name field → search just that column
 *   - national_id, phone_number → exact match (eq)
 *   - email → exact match (eq)
 */
import { BASE_URL, supabaseGet } from '../services/supabase';

const COLUMNS_TO_RETURN = [
  'first_name', 'last_name', 'gender', 'date_of_birth',
  'birth_place', 'national_id', 'email', 'phone_number',
];

/**
 * @param {object} attributes — the source node's entity attributes
 * @returns {Promise<object[]>} array of person records
 */
export default async function searchPerson(attributes) {
  const firstName = (attributes.first_name || '').trim();
  const lastName = (attributes.last_name || '').trim();
  const nationalId = (attributes.national_id || '').trim();
  const phone = (attributes.phone_number || '').trim();
  const email = (attributes.email || '').trim();

  const select = COLUMNS_TO_RETURN.join(',');

  // If both first and last name → use AND (two separate query params)
  if (firstName && lastName) {
    const url =
      `${BASE_URL}/person?select=${select}` +
      `&first_name=eq.${encodeURIComponent(firstName)}` +
      `&last_name=eq.${encodeURIComponent(lastName)}`;
    return supabaseGet(url);
  }

  // Otherwise build OR conditions from whatever is available
  const orConds = [];
  if (firstName) orConds.push(`first_name.eq.${encodeURIComponent(firstName)}`);
  if (lastName) orConds.push(`last_name.eq.${encodeURIComponent(lastName)}`);
  if (nationalId) orConds.push(`national_id.eq.${encodeURIComponent(nationalId)}`);
  if (phone) orConds.push(`phone_number.eq.${encodeURIComponent(phone)}`);
  if (email) orConds.push(`email.eq.${encodeURIComponent(email)}`);

  if (orConds.length === 0) return [];

  // Single condition → no need for or()
  if (orConds.length === 1) {
    const url = `${BASE_URL}/person?select=${select}&${orConds[0].replace('.eq.', '=eq.')}`;
    return supabaseGet(url);
  }

  const url = `${BASE_URL}/person?select=${select}&or=(${orConds.join(',')})`;
  return supabaseGet(url);
}
