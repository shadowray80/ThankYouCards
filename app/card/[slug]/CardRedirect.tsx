'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export function CardRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  useEffect(() => {
    if (slug) router.replace(`/?card=${slug}`);
  }, [slug, router]);

  return null;
}
