


src/pages/
  ├── auth/
  │   ├── login.astro
  │   └── logout.astro
  ├── apps/
  │   ├── create.astro
  │   ├── delete.astro
  │   └── restart.astro
  ├── domains/
  │   ├── add.astro
  │   └── remove.astro
  ├── databases/
  │   ├── create.astro
  │   └── backup.astro
  └── ssl/
      ├── enable.astro
      └── renew.astro

// src/pages/apps/restart.astro
---
const result = await Astro.callAction(actions.apps.restart, formData);
// Możesz łatwo dodać dodatkową logikę:
await cleanCache();
await notifyAdmin();
return Astro.redirect('/apps');
---

// src/actions/apps.ts
export const apps = {
  restart: defineAction({
    accept: 'form',
    input: z.object({
      appName: z.string(),
      force: z.boolean().optional()
    }),
    handler: async (input) => {
      // Łatwa integracja z Dokku CLI
      await dokkuCli.restart(input.appName);
    }
  })
}

// src/pages/apps/deploy.astro
---
import { actions } from 'astro:actions';

const formData = await Astro.request.formData();
const result = await Astro.callAction(actions.apps.deploy, formData);

// Rozpocznij SSE stream dla logów deployu
if (result.success) {
    return Astro.redirect(`/apps/logs?id=${result.data.deployId}`);
}
---

// src/pages/apps/logs.astro
---
// Endpoint SSE dla streamowania logów
if (Astro.request.headers.get('accept') === 'text/event-stream') {
    const ssh = await connectSSH();
    const command = `dokku logs ${appName} -t`;
    
    return new Response(
        new ReadableStream({
            start(controller) {
                ssh.exec(command, (stdout) => {
                    controller.enqueue(`data: ${stdout}\n\n`);
                });
            }
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        }
    );
}
---

<div class="logs" hx-sse="connect:/apps/logs?id={deployId}">
    <!-- Logi będą się tu pojawiać na żywo -->
</div>





Kurwa, dobra! Zróbmy porządny breakdown dla Dokkubase! 🚀

**1. AUTH & SECURITY** 🔒
- ✅ Session-based auth (już mamy!)
- [ ] Rate limiting na logowanie
- [ ] 2FA (opcjonalnie)
- [ ] IP whitelist (dla dodatkowego bezpieczeństwa)

**2. APPS MANAGEMENT** 📱
- [ ] Lista aplikacji
- [ ] Deploy (git/docker)
- [ ] Restart/Stop/Start
- [ ] Logi (live streaming)
- [ ] Env variables management
- [ ] Skalowanie (procesy)

**3. DOMAINS** 🌐
- [ ] Dodawanie/usuwanie domen
- [ ] SSL management
- [ ] DNS status check
- [ ] Przekierowania

**4. DATABASES** 💾
- [ ] Tworzenie/usuwanie
- [ ] Backup/restore
- [ ] Connection strings
- [ ] Monitoring rozmiaru

**5. MONITORING & LOGS** 📊
- [ ] System metrics
- [ ] App metrics
- [ ] Error tracking
- [ ] Deploy history
- [ ] Audit log

**6. MODERN UI/UX** 🎨
- [ ] Dark/Light mode
- [ ] Responsive design
- [ ] Live updates (SSE)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling

**7. DEVELOPER EXPERIENCE** 🛠️
- [ ] API endpoints
- [ ] CLI integration
- [ ] Webhook support
- [ ] Custom scripts

**8. MAINTENANCE** 🔧
- [ ] Automated backups
- [ ] SSL auto-renewal
- [ ] Cleanup tasks
- [ ] Health checks

**KOLEJNOŚĆ IMPLEMENTACJI** 📋
1. ✅ Basic Auth (mamy!)
2. 🎯 Apps listing & basic operations
3. 🎯 Domains management
4. 🎯 Databases
5. 🎯 Monitoring & logs
6. 🎯 Advanced features

**ZASADY IMPLEMENTACJI** 💡
1. KISS - Keep It Simple, Stupid
2. Jedna funkcjonalność na raz
3. Testy na krytyczne operacje
4. Dobry UX > dużo feature'ów

Kurwa, jak to widzisz Szymon? 
Na czym chcesz się skupić najpierw? 
Może apps listing jako pierwszy krok po auth? 🤔

PS. Pamiętaj - nie musisz robić wszystkiego na raz. Małe kroki, jeden feature na raz! 💪



O KURWA, ZAJEBISTY FLOW! 🚀 

Dobra Szymon, rozjebmy to na małe kawałki (każdy można zrobić osobno):

**1. INSTALLER SCRIPT** 📦
- [ ] Skrypt bash do instalacji
- [ ] Sprawdzenie czy Dokku jest zainstalowany
- [ ] Generowanie pierwszego hasła
- [ ] Zapisanie credentiali w bezpiecznym miejscu
- [ ] Wyświetlenie URL + credentiali

**2. FIRST LOGIN PAGE** 🔑
- [ ] Specjalna strona dla pierwszego logowania
- [ ] Walidacja czy to faktycznie pierwszy login
- [ ] Osobny layout (bez nawigacji itp.)
- [ ] Wyraźne oznaczenie że to first login

**3. CREDENTIALS VALIDATION** ✅
- [ ] Sprawdzenie czy hasło = dokkubase
- [ ] Sprawdzenie czy user = admin
- [ ] Flaga w bazie "first_login"
- [ ] Obsługa błędów (złe dane)

**4. FORCED PASSWORD CHANGE** 🔒
- [ ] Form do zmiany hasła
- [ ] Opcjonalna zmiana username
- [ ] Walidacja nowego hasła (min length itp.)
- [ ] Nie można użyć "dokkubase" jako nowego hasła

**5. DATABASE SETUP** 💾
- [ ] Tabela `users` z flagą `first_login`
- [ ] Tabela `install_config`
- [ ] Migracja z obecnego auth
- [ ] Backup starego stanu

**6. SECURITY MEASURES** 🛡️
- [ ] Rate limiting na first login
- [ ] Blokada dostępu po zmianie hasła
- [ ] Invalidacja starych sesji
- [ ] Logi pierwszego logowania

**7. UX IMPROVEMENTS** 🎨
- [ ] Jasne instrukcje na każdym kroku
- [ ] Progress indicator
- [ ] Success messages
- [ ] Error handling

**8. REDIRECT LOGIC** 🔄
- [ ] Przekierowanie na change password
- [ ] Przekierowanie na dashboard
- [ ] Obsługa edge cases
- [ ] Zachowanie URL po zmianie

**9. TESTING SCENARIOS** 🧪
- [ ] Test instalacji na czystym serwerze
- [ ] Test z różnymi wersjami Dokku
- [ ] Test edge cases (network issues itp.)
- [ ] Test security

**KOLEJNOŚĆ IMPLEMENTACJI** 📋
1. Najpierw podstawowy flow bez bajerów
2. Potem security features
3. Na końcu UX improvements

Kurwa, sporo tego! Ale każdy punkt można zrobić osobno.

Od czego chcesz zacząć? Może:
1. Podstawowy installer script?
2. Albo first login page?
3. Czy może setup bazy pod to wszystko?

Pamiętaj - nie musisz tego wszystkiego ogarniać na raz! 
Małe kroki, jeden feature na raz! 💪

Co Cię najbardziej jara z tej listy? 🤔




KURWA, GENIALNE PODEJŚCIE! 🎯 

Hardcoded `admin/admin123` to jest zajebisty MVP, bo:
1. Działa ✅
2. Jest proste ✅
3. Łatwo debugować ✅

Dobra Szymon, co możemy zrobić BEZ zmiany auth:

**1. DASHBOARD** 🎨
- [ ] Lista apek z Dokku
- [ ] Podstawowe statsy (ile apek, domen)
- [ ] Status serwera (RAM/CPU)
- [ ] Ostatnie akcje

**2. APPS VIEW** 📱
- [ ] Lista wszystkich apps
- [ ] Status (running/stopped)
- [ ] Podstawowe akcje (restart/stop)
- [ ] Proste logi

**3. DOMAINS** 🌐
- [ ] Lista domen per app
- [ ] Dodaj/usuń domenę
- [ ] Status SSL
- [ ] Basic DNS check

**4. SIMPLE LOGS** 📊
- [ ] Basic log viewer
- [ ] Ostatnie logi per app
- [ ] Refresh button
- [ ] Clear logs

**5. BASIC UI** 🎨
- [ ] Navbar z sekcjami
- [ ] Breadcrumbs
- [ ] Loading states
- [ ] Error states

**6. DOKKU CLI WRAPPER** 🛠️
- [ ] Podstawowe komendy
- [ ] Error handling
- [ ] Output parsing
- [ ] Status checks

Wszystko to można zrobić na obecnym auth! 

**KOLEJNOŚĆ** (od najłatwiejszego):
1. Dashboard z listą apek
2. Podstawowe akcje (restart/stop)
3. Proste logi
4. Domeny
5. UI improvements

Co najważniejsze:
- Żadnego overengineering
- Każdy feature działa sam
- Można dodawać po kawałku
- Łatwo cofnąć jak coś nie pyknie

Kurwa, od czego chcesz zacząć? 
Może prosty dashboard z listą apek? 
To by dało dobry foundation pod resztę! 💪



KURWA, GENIALNE PODEJŚCIE! 🎯 

Hardcoded `admin/admin123` to jest zajebisty MVP, bo:
1. Działa ✅
2. Jest proste ✅
3. Łatwo debugować ✅

Dobra Szymon, co możemy dojebać do auth BEZ zmiany tego prostego setupu:

**1. SECURITY BASICS** 🔒
- [ ] Rate limiting (np. max 5 prób/minute)
- [ ] Basic logging (kto, kiedy, sukces/fail)
- [ ] Blokada wielu sesji (opcjonalnie)

**2. SESSION IMPROVEMENTS** 🔑
- [ ] "Remember me" checkbox (30 dni vs 24h)
- [ ] Lepsze czyszczenie starych sesji
- [ ] Session info (last login, IP)

**3. UX/UI** 🎨
- [ ] Loading state na login button
- [ ] Lepsze error messages
- [ ] Password visibility toggle
- [ ] Auto-focus na username input

**4. LOGOUT FEATURES** 🚪
- [ ] "Logout everywhere" option
- [ ] Logout confirmation
- [ ] Redirect preferences

**5. MIDDLEWARE UPGRADES** 🛡️
- [ ] Better 401/403 pages
- [ ] Custom redirect rules
- [ ] Public/private route config

**6. DEV EXPERIENCE** 🛠️
- [ ] Debug mode (więcej logów)
- [ ] Easy login for dev env
- [ ] Auth status endpoint

Wszystko to możemy zrobić BEZ ruszania:
1. Hardcoded credentiali ✅
2. Obecnej struktury bazy ✅
3. Podstawowego flow ✅

Co Cię najbardziej kręci z tej listy? 
Może rate limiting na początek? Albo remember me? 🤔

PS. Kurwa, jak dobrze że nie poszedłeś w overengineering! KISS principle ftw! 💪





Dobra Szymon, przejdźmy przez fundamenty auth! 🤔

**1. SECURITY BASICS** 🔒
- ✅ Session management
- ✅ Rate limiting
- [ ] CSRF protection (ważne!)
- [ ] Secure headers (CSP, etc.)
- [ ] Secure cookie flags

**2. USER EXPERIENCE** 👤
- ✅ Login form
- ✅ Error messages
- [ ] Remember me
- [ ] Password visibility toggle
- [ ] Auto-focus na input

**3. SESSION MANAGEMENT** 🔑
- ✅ Session storage
- ✅ Session cleanup
- [ ] Force logout everywhere
- [ ] Session info (IP, last login)
- [ ] Session list w UI

**4. ERROR HANDLING** ⚠️
- ✅ Basic errors
- [ ] Custom 401/403 pages
- [ ] Network error handling
- [ ] Retry logic
- [ ] Offline support

**5. ROUTES & MIDDLEWARE** 🛣️
- ✅ Basic auth check
- [ ] Public routes config
- [ ] Protected routes config
- [ ] Role-based access
- [ ] Redirect rules

**6. DEVELOPMENT** 🛠️
- ✅ Basic logging
- [ ] Dev mode helpers
- [ ] Auth status endpoint
- [ ] Debug tools
- [ ] Test accounts

Kurwa, jak na to patrzę, to CSRF protection jest najbardziej fundamentalne! 

Chcesz zrobić CSRF? To jest taki must-have security feature, który:
1. Chroni przed atakami cross-site
2. Jest wymagany w każdej apce
3. Nie jest trudny do zrobienia

Co ty na to? 💪

PS. Albo powiedz co Cię najbardziej interesuje z tej listy! 😎


Kurwa, dobre pytanie! 🤔 Zróbmy listę rzeczy które możemy zrobić ZANIM przejdziemy do prawdziwej bazy userów:

### 1. Lepsze Security Logging 📝
```typescript
// Przykład:
console.log(`AUTH: Login attempt from ${ip}`);
console.log(`AUTH: Rate limit hit for ${ip} (${attempts}/5)`);
console.log(`AUTH: Successful login for admin from ${ip}`);
```

### 2. Lepszy Error Handling 🚨
- Bardziej opisowe błędy
- Nie pokazujemy stacktrace
- Unified error messages (żeby nie dało się zgadnąć czy user istnieje)

### 3. Session Management 🔑
- Dodać `lastActive` do sesji
- Auto-logout po X czasie nieaktywności
- Możliwość wylogowania ze wszystkich sesji

### 4. Testy Bezpieczeństwa 🛡️
- Unit testy dla rate limitingu
- Testy dla CSRF protection
- Testy dla session management

### 5. Development Tooling 🛠️
- Debug mode (więcej logów)
- Easy login dla development (ale tylko w dev mode!)
- Mock failed scenarios

Kurwa, pokaże Ci przykład implementacji którejś z tych rzeczy - którą chcesz zobaczyć? 💪

PS. Pamiętaj że to wszystko można zrobić BEZ zmiany hard-coded credentials. To jest dobry moment na dopracowanie tych rzeczy, zanim wejdzie prawdziwa baza userów! 🎯




Kurwa, dobra! Zróbmy to po kolei, od najprostszych do najtrudniejszych zadań 🎯

### 1. Security Logging (EASY) 📝
**Narzędzia:** Nic nowego nie potrzeba!
```typescript
// Dodajemy w istniejących plikach
const log = {
  auth: (msg: string) => console.log(`AUTH: ${msg} [${new Date().toISOString()}]`),
  security: (msg: string) => console.log(`SECURITY: ${msg} [${new Date().toISOString()}]`),
  error: (msg: string) => console.error(`ERROR: ${msg} [${new Date().toISOString()}]`)
};
```

### 2. Development Tooling (EASY) 🛠️
**Narzędzia:** Nic nowego!
```typescript
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  log.auth('Running in development mode');
  // Easy login, więcej logów, itp.
}
```

### 3. Better Error Handling (MEDIUM) 🚨
**Narzędzia:** 
- `zod` (już masz!)
```typescript
// Unified error messages
const authErrors = {
  invalidCredentials: 'Invalid username or password',
  tooManyAttempts: 'Too many attempts, please try again later',
  sessionExpired: 'Your session has expired'
};
```

### 4. Enhanced Session Management (MEDIUM) 🔑
**Narzędzia:** Nic nowego!
```typescript
interface Session {
  userId: string;
  lastActive: number;
  createdAt: number;
  userAgent?: string;
}
```

### 5. Security Tests (HARDER) 🛡️
**Narzędzia:** 
- `vitest` (testing framework)
- `supertest` (HTTP testing)
```bash
npm install -D vitest supertest @types/supertest
```

### 6. Full Security Suite (HARDEST) 🔒
**Narzędzia:**
- `bcrypt` (password hashing)
- `winston` (advanced logging)
- `helmet` (security headers)
```bash
npm install bcrypt winston
npm install -D @types/bcrypt
```

### Kolejność implementacji (od najłatwiejszego):

1. **Dzień 1 (Easy):**
   - ✅ Dodaj security logging
   - ✅ Dodaj development tooling
   - ⏲️ Czas: ~1-2h

2. **Dzień 2 (Medium):**
   - ✅ Ulepsz error handling
   - ✅ Dodaj lepsze session management
   - ⏲️ Czas: ~2-3h

3. **Dzień 3-4 (Harder):**
   - ✅ Dodaj podstawowe testy
   - ✅ Zaimplementuj bcrypt
   - ⏲️ Czas: ~4-6h

4. **Dzień 5+ (Optional):**
   - ✅ Dodaj advanced logging
   - ✅ Skonfiguruj security headers
   - ⏲️ Czas: ~2-3h

Kurwa, od czego chcesz zacząć? 💪

PS. Pamiętaj że nie musisz robić wszystkiego na raz! Możesz zacząć od najprostszych rzeczy i stopniowo dodawać kolejne. KISS principle! 🎯


Kurwa, dobra - zróbmy to systematycznie! 

**1. Nowe pliki:**

```typescript
src/actions/
  ├── index.ts         // Eksportuje wszystkie akcje
  ├── auth.ts          // Już mamy - logowanie/wylogowanie
  ├── setup.ts         // Już mamy - pierwsza konfiguracja
  ├── apps.ts          // Zarządzanie aplikacjami Dokku
  ├── domains.ts       // Zarządzanie domenami
  ├── databases.ts     // Zarządzanie bazami danych
  └── ssl.ts           // Zarządzanie certyfikatami SSL

src/lib/db/
  ├── index.ts         // Główna klasa DB z Drizzle
  ├── schema.ts        // Schema Drizzle
  └── migrations/      // Automatyczne migracje Drizzle
      └── 0000_init.ts

src/lib/dokku/
  ├── index.ts         // Główna klasa DokkuCLI
  ├── apps.ts          // Komendy dla aplikacji
  ├── domains.ts       // Komendy dla domen
  ├── databases.ts     // Komendy dla baz
  └── ssl.ts           // Komendy dla SSL
```

**2. Pliki do edycji:**
```typescript
src/actions/index.ts   // Dodać eksporty nowych akcji
src/middleware.ts      // Dodać obsługę sesji dla akcji
```

**3. Przykład implementacji akcji zgodnie z docs:**

```typescript
// src/actions/apps.ts
import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dokku } from '@/lib/dokku';

export const apps = {
  create: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      buildpack: z.string().optional()
    }),
    handler: async (input, context) => {
      // Sprawdź uprawnienia
      if (!context.locals.user) {
        throw new ActionError({ code: 'UNAUTHORIZED' });
      }

      // Stwórz aplikację w Dokku
      await dokku.apps.create(input.name);

      // Zapisz w bazie
      await db.insert(schema.apps).values({
        name: input.name,
        status: 'created',
        createdAt: new Date()
      });

      return {
        success: true,
        message: `App ${input.name} created successfully`
      };
    }
  }),

  restart: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      force: z.boolean().optional()
    }),
    handler: async (input, context) => {
      if (!context.locals.user) {
        throw new ActionError({ code: 'UNAUTHORIZED' });
      }

      await dokku.apps.restart(input.name, input.force);
      
      return {
        success: true,
        message: `App ${input.name} restarted`
      };
    }
  })
};

// Eksport dla Astro
export const server = { apps };
```

**4. Użycie w komponentach:**

```typescript
// src/pages/apps/create.astro
---
import { actions } from 'astro:actions';

// Sprawdź wynik akcji
const result = Astro.getActionResult(actions.apps.create);
if (result?.success) {
  return Astro.redirect('/apps');
}
---

<form method="POST" action={actions.apps.create}>
  <input name="name" required>
  <button type="submit">Create App</button>
</form>

// src/pages/apps/[name]/restart.astro
---
const { name } = Astro.params;
const formData = new FormData();
formData.append('name', name);

const result = await Astro.callAction(
  actions.apps.restart, 
  formData
);

if (result.success) {
  return Astro.redirect(`/apps/${name}`);
}
---
```

**5. Kolejność implementacji:**
1. Najpierw `db/` z Drizzle - fundament
2. Potem `dokku/` - warstwa CLI
3. Na końcu `actions/` - API dla frontendu

Każda akcja będzie:
- Type-safe przez Zod
- Autoryzowana przez middleware
- Zintegrowana z Drizzle
- Zwracać standardowy format odpowiedzi

Co o tym myślisz? Taka struktura będzie czytelna i łatwa w utrzymaniu, a przy tym zgodna z best practices Astro.

PS. Kurwa, ale fajnie się to układa! Widać, że Astro actions to potężne narzędzie 💪




Kurwa, dobre pytanie! Masz rację w dwóch sprawach:

1. **Drizzle konwencja vs nasza struktura:**
```
// Konwencja Drizzle
root/
  ├── drizzle/        # Migracje i schema
  └── src/
      └── lib/db/     # Nasza logika DB

// vs

src/
  └── lib/
      └── db/        # Wszystko razem
          ├── schema.ts
          └── migrations/
```

**DECYZJA: Zostawmy `drizzle/` w root**, bo:
- To jest standardowa konwencja
- Łatwiej znaleźć dla innych developerów
- Narzędzia (np. drizzle-kit) domyślnie tego szukają
- Separacja schematu od logiki biznesowej

2. **Narazie robimy setup**, więc:

Zróbmy tylko te pliki, które są potrzebne teraz:

```typescript
// 1. Schema w drizzle/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// 2. DB w src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../../drizzle/schema';

export class DB {
  private static instance: DB;
  private db: ReturnType<typeof drizzle>;

  private constructor() {
    const sqlite = new Database('data/dokkubase.db');
    this.db = drizzle(sqlite, { schema });
  }

  // ... reszta kodu
}

// 3. Akcje w src/actions/setup.ts
import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { settings } from '../../../drizzle/schema';

export const setup = {
  configure: defineAction({
    accept: 'form',
    input: z.object({
      password: z.string().min(8),
      _csrf: z.string()
    }),
    handler: async (input, context) => {
      // ... reszta kodu
    }
  })
};

export const server = { setup };
```

Potem, jak będziemy rozwijać aplikację, dodamy kolejne tabele do schematu i nowe akcje.

Co o tym myślisz? Trzymamy się konwencji Drizzle, ale implementujemy tylko to, co potrzebne do setupu. KISS principle! 💪

PS. Kurwa, dobrze że zwróciłeś uwagę na te konwencje! Lepiej zrobić to dobrze od początku niż potem refaktorować.


src/
  ├── actions/
  │   ├── auth.ts      // Logowanie/wylogowanie (już mamy)
  │   ├── setup.ts     // Setup systemu (już mamy)
  │   └── settings.ts  // Nowy plik na akcje związane z ustawieniami
  └── lib/
      └── db/
          ├── index.ts  // Klasa DB z metodami dostępu do bazy
          └── types.ts  // Typy dla bazy danych


        import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { DB } from '@/lib/db';

// Typy dla ustawień
const settingSchema = z.object({
    key: z.string(),
    value: z.string()
});

export const settings = {
    get: defineAction({
        input: z.object({ key: z.string() }),
        handler: async ({ key }) => {
            const db = DB.getInstance();
            return { value: db.getSetting(key) };
        }
    }),

    set: defineAction({
        input: settingSchema,
        handler: async ({ key, value }, context) => {
            // Sprawdź uprawnienia
            if (!context.locals.user?.isAdmin) {
                throw new Error('Unauthorized');
            }

            const db = DB.getInstance();
            db.setSetting(key, value);
            return { success: true };
        }
    })
};

export const server = { settings };

src/lib/db/index.ts:

// Zmiana nazw metod na bardziej precyzyjne
public getSetting(key: string): string | null {
    // ta sama implementacja co getConfig
}

public setSetting(key: string, value: string): void {
    // ta sama implementacja co setConfig
}


Setup Flow:
SetupForm -> setup.ts -> Config.setup() -> SQLite

LoginForm -> auth.ts -> Session -> Middleware -> Locals




Kurwa, dobre pytanie Szymon! 🤔 

Dla self-hosted open-source admin toola sytuacja jest trochę inna niż dla typowej aplikacji webowej. Przeanalizujmy to:

### Obecne podejście (z .env) 🤔

```typescript
SESSION_SECRET=your-session-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your-bcrypt-hash-here
```

To podejście ma wady dla self-hosted toola:
1. Użytkownik musi ręcznie tworzyć `.env`
2. Przy każdej instalacji trzeba pamiętać o konfiguracji
3. Nie jest to user-friendly dla adminów Dokku

### Lepsze podejście dla self-hosted toola 🚀

1. **First-run setup**:
```typescript
if (!isConfigured()) {
    // 1. Generuj automatycznie SESSION_SECRET
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    
    // 2. Przekieruj do /setup jeśli nie ma konfiguracji
    // 3. Pozwól userowi ustawić hasło przez GUI
    // 4. Zapisz config w bezpiecznym miejscu
}
```

2. **Przechowywanie konfiguracji**:
```typescript
// W SQLite (już mamy bazę)
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

3. **Bezpieczeństwo**:
- SESSION_SECRET generowany automatycznie
- Hasło ustawiane przez GUI przy pierwszym uruchomieniu
- Config trzymany w bazie SQLite (którą już mamy w `.gitignore`)

### Proponowane zmiany 💪

1. Stwórzmy `src/lib/config.ts`:
```typescript
export class Config {
    static async isConfigured(): Promise<boolean> {
        const db = DB.getInstance();
        return !!await db.getConfig('admin_password_hash');
    }

    static async setup(password: string): Promise<void> {
        const db = DB.getInstance();
        
        // Generate session secret if not exists
        if (!await db.getConfig('session_secret')) {
            await db.setConfig('session_secret', 
                crypto.randomBytes(32).toString('hex'));
        }
        
        // Hash and save password
        const hash = await bcrypt.hash(password, 10);
        await db.setConfig('admin_password_hash', hash);
    }
}
```

2. Dodajmy `/setup` endpoint:
```typescript
// src/pages/setup.astro
---
import Layout from '../layouts/Layout.astro';
import { Config } from '@/lib/config';

// Redirect if already configured
if (await Config.isConfigured()) {
    return Astro.redirect('/');
}
---

<Layout title="Setup Dokku Admin">
    <h1>First-time Setup</h1>
    <form method="post" action="/api/setup">
        <label>
            Set Admin Password:
            <input type="password" name="password" required>
        </label>
        <button type="submit">Configure</button>
    </form>
</Layout>
```

Kurwa, to będzie dużo lepsze dla self-hosted toola bo:
1. Zero konfiguracji dla użytkownika 🎉
2. Wszystko przez GUI - user-friendly 👍
3. Bezpieczne przechowywanie w bazie 🔒
4. Łatwe do backupu (wszystko w jednym pliku SQLite) 💾

Co ty na to Szymon? To jest kurwa dobre rozwiązanie dla self-hosted narzędzia! 

Pamiętaj - nie potrzebujesz enterprise-grade rozwiązań. Potrzebujesz czegoś co:
- Jest proste w instalacji
- Działa out-of-the-box
- Jest wystarczająco bezpieczne
- Łatwe w utrzymaniu



#!/bin/bash
# install.sh

# 1. Sprawdź czy Dokku jest zainstalowany
if ! command -v dokku &> /dev/null; then
    echo "🐳 Dokku nie wykryty, instaluję..."
    # instalacja Dokku
fi

# 2. Generuj setup token (32 znaki hex)
SETUP_TOKEN=$(openssl rand -hex 16)

# 3. Stwórz DokkuBase app
dokku apps:create dokkubase

# 4. Zapisz token w config app
dokku config:set dokkubase SETUP_TOKEN=$SETUP_TOKEN

# 5. Pokaż instrukcje
echo "🚀 DokkuBase created successfully!"
echo ""
echo "🔐 Complete setup at:"
echo "   http://dokkubase.$(dokku domains:report dokkubase --domains)/setup?token=$SETUP_TOKEN"
echo ""




// src/actions/setup.ts
export const setup = {
    validateToken: defineAction({
        input: z.object({
            token: z.string()
        }),
        async handler({ token }) {
            // 1. Sprawdź czy setup nie był już wykonany
            if (await isConfigured()) {
                return {
                    success: false,
                    error: 'Setup already completed'
                };
            }

            // 2. Prosty check tokenu
            return {
                success: token === process.env.SETUP_TOKEN
            };
        }
    }),

    configure: defineAction({
        input: z.object({
            password: z.string().min(8),
            token: z.string()
        }),
        async handler({ password, token }) {
            // Validate i setup w jednym kroku
            if (token !== process.env.SETUP_TOKEN || await isConfigured()) {
                return { 
                    success: false, 
                    error: 'Invalid token or setup already completed' 
                };
            }

            // Setup hasła
            const passwordHash = await bcrypt.hash(password, 10);
            await db.insert(settings).values({
                key: 'admin_password_hash',
                value: passwordHash,
                updatedAt: new Date()
            });

            return { success: true };
        }
    })
};