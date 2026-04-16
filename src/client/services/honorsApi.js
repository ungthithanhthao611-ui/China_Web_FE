import { getHonors } from '@/client/services/publicApi'

export function getHonorsPageData(query = {}) {
  return getHonors(query)
}
