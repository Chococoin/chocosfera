# Roadmap: Character Creation & Family Profiles System

## Overview
Esta es la **funcionalidad estrella** de Chocósfera: un sistema completo de creación de personajes y perfiles familiares que permite a las familias colaborar en la creación de historias y personajes dentro del universo de Chocósfera.

---

## Current State Analysis

### Registration Flow (Current)
- **Location:** `/app/[locale]/register/page.tsx`
- **Fields collected:** nick, email, password
- **Validation:** Strong password requirements (15+ chars, uppercase, lowercase, number, special char)
- **Status:** Frontend only - backend authentication pending (`TODO: Implementar lógica de registro` at line 86)

### Login Flow (Current)
- **Location:** `/app/[locale]/login/page.tsx`
- **Fields:** usernameOrEmail, password
- **Status:** Frontend only - backend authentication pending (`TODO: Implementar lógica de login` at line 19)

### Dashboard Structure (Current)
- `/dashboard` - Main dashboard
- `/dashboard/trees` - User's adopted trees
- `/dashboard/marketplace` - Product marketplace
- `/dashboard/community` - Telegram community integration
- `/dashboard/traceability` - Product traceability
- `/dashboard/impact` - Environmental impact
- `/dashboard/settings` - User settings & subscriptions

---

## Phase 1: User Status & Authentication System

### 1.1 User Status Types
```typescript
enum UserStatus {
  MINOR = 'minor',           // Default - Restricted access
  ADULT_PENDING = 'pending', // KYC submitted, awaiting verification
  ADULT_VERIFIED = 'adult'   // Full access, can create family profiles
}

enum UserRole {
  USER = 'user',
  FAMILY_ADMIN = 'family_admin', // Can manage family profile
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}
```

### 1.2 User Schema
```typescript
interface User {
  id: string;
  nick: string;
  email: string;
  passwordHash: string;

  // Status & Role
  status: UserStatus;
  role: UserRole;

  // Profile
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;

  // Family Linking
  familyId?: string;

  // KYC
  kycSubmittedAt?: Date;
  kycVerifiedAt?: Date;
  kycDocuments?: KYCDocument[];

  // Restrictions
  telegramAccess: boolean; // false for minors

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  locale: string;
  timezone?: string;
}
```

### 1.3 Backend Implementation
**Priority: HIGH**

1. **Database Setup**
   - [ ] Choose database (PostgreSQL recommended for relational data)
   - [ ] Set up Prisma ORM or similar
   - [ ] Create User model with migrations
   - [ ] Create indexes on email, nick, familyId

2. **Authentication API Routes**
   - [ ] `/api/auth/register` - User registration with email verification
   - [ ] `/api/auth/login` - Login with JWT token generation
   - [ ] `/api/auth/logout` - Session cleanup
   - [ ] `/api/auth/verify-email` - Email verification flow
   - [ ] `/api/auth/forgot-password` - Password reset flow
   - [ ] `/api/auth/reset-password` - Complete password reset

3. **Session Management**
   - [ ] Implement JWT or session-based auth
   - [ ] Create auth middleware for protected routes
   - [ ] Add session refresh mechanism
   - [ ] Implement secure httpOnly cookies

4. **Default User Status**
   - [ ] All new registrations default to `status: 'minor'`
   - [ ] `telegramAccess: false` by default
   - [ ] Restrict access to Community chat features for minors

---

## Phase 1.5: Email Invitation System

### 1.5.1 Invitation Flow: Minor → Parent

**Use Case:** A child registers on Chocósfera and wants to invite their parent to join the family profile.

```typescript
interface Invitation {
  id: string;
  inviterId: string;        // Minor who sends invite
  inviterEmail: string;
  recipientEmail: string;   // Parent's email
  recipientUserId?: string; // Filled if parent already has account

  type: 'FAMILY_INVITE';
  status: 'pending' | 'accepted' | 'declined' | 'expired';

  token: string;            // Unique invitation token
  expiresAt: Date;          // 7 days validity

  acceptedAt?: Date;
  createdAt: Date;
}
```

### 1.5.2 Invitation Workflow

#### Step 1: Minor Sends Invitation
**Location:** `/dashboard/settings` (new section "Family")

```typescript
// UI Component
<InviteParentSection>
  <input type="email" placeholder="Email de tu padre/madre" />
  <button>Enviar Invitación</button>
</InviteParentSection>

// API: POST /api/family/invite
{
  recipientEmail: "parent@example.com",
  relationship: "parent" // future: could be 'guardian', 'sibling'
}
```

#### Step 2: Parent Receives Email
**Email Template:**
```
Subject: 🍫 [Child's Nick] te ha invitado a Chocósfera

Hola!

Tu hijo/a [Child's Nick] te ha invitado a unirte a su familia en Chocósfera.

Chocósfera es una plataforma donde las familias pueden:
- Adoptar árboles de cacao juntos
- Ver su impacto ambiental familiar
- Crear personajes e historias en el universo del chocolate

[Aceptar Invitación] → https://chocosfera.com/invite/[TOKEN]

Esta invitación expira en 7 días.
```

#### Step 3: Parent Accepts Invitation

**Route:** `/invite/[token]`

1. **Parent has NO account:**
   - Redirect to `/register?invite=[token]`
   - Pre-fill email from invitation
   - After registration → Auto-link to family
   - Suggest parent to upgrade to adult status via KYC

2. **Parent already has account:**
   - Redirect to `/login?invite=[token]`
   - After login → Show confirmation modal
   - Accept → Link accounts to family
   - Create family profile if doesn't exist

#### Step 4: Family Linking
```typescript
// After parent accepts:
1. Check if parent has adult status
2. If parent is adult:
   - Create FamilyProfile (if not exists)
   - Set parent as family_admin
   - Link child to family
3. If parent is also minor:
   - Create pending family link
   - Encourage parent to complete KYC
   - Once parent verifies → activate family features
```

### 1.5.3 API Endpoints

```typescript
// Send invitation
POST /api/family/invite
Body: { recipientEmail: string }
Response: { invitationId: string, expiresAt: Date }

// Validate invitation token
GET /api/family/invite/[token]/validate
Response: { valid: boolean, inviterInfo: { nick, email }, expired: boolean }

// Accept invitation
POST /api/family/invite/[token]/accept
Auth: Required (recipient must be logged in)
Response: { familyId: string, success: boolean }

// List pending invitations (for user)
GET /api/family/invitations
Auth: Required
Response: { sent: Invitation[], received: Invitation[] }

// Cancel invitation
DELETE /api/family/invite/[invitationId]
Auth: Required (only inviter can cancel)
```

### 1.5.4 Database Tables

```sql
-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES users(id),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID REFERENCES users(id),

  type VARCHAR(50) NOT NULL DEFAULT 'FAMILY_INVITE',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,

  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_token (token),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status)
);
```

---

## Phase 2: KYC (Know Your Customer) System

### 2.1 KYC Purpose
- Verify user is 18+ years old
- Upgrade from `minor` to `adult` status
- Unlock family profile creation
- Grant Telegram community access

### 2.2 KYC Schema
```typescript
interface KYCDocument {
  id: string;
  userId: string;
  type: 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE';
  documentNumber: string;
  documentCountry: string;

  // Uploaded files
  frontImageUrl: string;
  backImageUrl?: string;
  selfieUrl: string;

  // Extracted data
  firstName: string;
  lastName: string;
  dateOfBirth: Date;

  // Verification
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;

  createdAt: Date;
}
```

### 2.3 KYC Flow

#### Location: `/dashboard/settings` → "Verificar Edad (KYC)"

```typescript
<KYCSection>
  {user.status === 'minor' && (
    <>
      <Alert type="info">
        Para acceder a funciones completas y crear perfiles familiares,
        verifica que eres mayor de edad.
      </Alert>

      <KYCUploadForm>
        <select name="documentType">
          <option>Cédula / ID Card</option>
          <option>Pasaporte</option>
          <option>Licencia de Conducir</option>
        </select>

        <FileUpload label="Foto frontal del documento" />
        <FileUpload label="Foto trasera (si aplica)" />
        <FileUpload label="Selfie sosteniendo el documento" />

        <input type="text" placeholder="Número de documento" />
        <select name="country">Countries...</select>
        <input type="date" placeholder="Fecha de nacimiento" />

        <button type="submit">Enviar para Verificación</button>
      </KYCUploadForm>
    </>
  )}

  {user.status === 'pending' && (
    <Alert type="warning">
      Tu solicitud de verificación está en proceso.
      Revisaremos tu información en 24-48 horas.
    </Alert>
  )}

  {user.status === 'adult' && (
    <Alert type="success">
      ✅ Cuenta verificada - Tienes acceso completo
    </Alert>
  )}
</KYCSection>
```

### 2.4 KYC API Endpoints

```typescript
// Submit KYC
POST /api/kyc/submit
Auth: Required
Body: FormData (files + metadata)
Response: { kycId: string, status: 'pending' }

// Check KYC status
GET /api/kyc/status
Auth: Required
Response: { status: UserStatus, submittedAt?: Date, reviewedAt?: Date }

// Admin: Review KYC (future)
POST /api/admin/kyc/[kycId]/review
Auth: Admin only
Body: { approved: boolean, rejectionReason?: string }
Response: { success: boolean }
```

### 2.5 Document Storage
- Use AWS S3 or Cloudflare R2 for secure document storage
- Encrypt documents at rest
- Set strict access policies (only admins can view)
- Auto-delete documents after 30 days of approval/rejection

### 2.6 Age Verification Logic
```typescript
function verifyAge(dateOfBirth: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}
```

---

## Phase 3: Family Profile System

### 3.1 Family Schema
```typescript
interface FamilyProfile {
  id: string;
  name: string; // "Familia García"

  // Admin
  adminUserId: string; // Must be adult

  // Members
  memberIds: string[]; // All family members

  // Visual
  coverImageUrl?: string;
  familyMotto?: string;

  // Aggregated Stats
  totalTrees: number;
  totalCO2Offset: number;
  totalChocoCoins: number;

  // Settings
  isPublic: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface FamilyMember {
  userId: string;
  familyId: string;
  role: 'admin' | 'member';
  nickname?: string; // Family nickname
  joinedAt: Date;
}
```

### 3.2 Family Creation Flow

#### Only Adults Can Create Families

**Location:** `/dashboard/settings` → "Familia" section

```typescript
{user.status === 'adult' && !user.familyId && (
  <CreateFamilySection>
    <h3>Crear Perfil Familiar</h3>
    <input placeholder="Nombre de la familia (ej: Familia García)" />
    <textarea placeholder="Lema familiar (opcional)" />
    <button>Crear Familia</button>
  </CreateFamilySection>
)}

{user.familyId && (
  <FamilyCard>
    <Link href="/dashboard/family">
      Ver Perfil Familiar →
    </Link>
  </FamilyCard>
)}
```

### 3.3 Family Dashboard

**New Route:** `/dashboard/family/page.tsx`

```typescript
interface FamilyDashboardProps {
  family: FamilyProfile;
  members: (User & { trees: Tree[] })[];
  familyTrees: Tree[];
  totalImpact: ImpactStats;
}

<FamilyDashboard>
  {/* Hero Section */}
  <FamilyHeader>
    <h1>{family.name}</h1>
    <p>{family.familyMotto}</p>
    <p>{members.length} miembros</p>
  </FamilyHeader>

  {/* Family Stats */}
  <StatsGrid>
    <Stat label="Árboles Familiares" value={totalTrees} />
    <Stat label="CO₂ Compensado" value={totalCO2} />
    <Stat label="ChocoCoins Familiar" value={totalCoins} />
    <Stat label="Países" value={uniqueCountries} />
  </StatsGrid>

  {/* Family Members */}
  <MembersSection>
    {members.map(member => (
      <MemberCard>
        <Avatar src={member.avatarUrl} />
        <p>{member.nick}</p>
        <p>{member.trees.length} árboles</p>
        {member.status === 'minor' && <Badge>Menor</Badge>}
      </MemberCard>
    ))}

    {isAdmin && (
      <button onClick={() => openInviteModal()}>
        + Invitar Familiar
      </button>
    )}
  </MembersSection>

  {/* Family Trees Map */}
  <TreesMapSection>
    <h2>Nuestros Árboles en el Mundo</h2>
    <InteractiveMap trees={familyTrees} />
  </TreesMapSection>

  {/* Character Creation Section */}
  <CharacterSection>
    <h2>Personajes Familiares</h2>
    <CharacterGallery characters={familyCharacters} />
    <Link href="/dashboard/family/characters/create">
      Crear Nuevo Personaje →
    </Link>
  </CharacterSection>

  {/* Family Stories */}
  <StoriesSection>
    <h2>Historias de la Familia</h2>
    <StoryList stories={familyStories} />
  </StoriesSection>
</FamilyDashboard>
```

### 3.4 Family API Endpoints

```typescript
// Create family
POST /api/family/create
Auth: Required (adult status only)
Body: { name: string, motto?: string }
Response: { familyId: string }

// Get family profile
GET /api/family/[familyId]
Auth: Required (family member only)
Response: FamilyProfile

// Update family
PATCH /api/family/[familyId]
Auth: Required (admin only)
Body: { name?, motto?, coverImage? }

// Get family members
GET /api/family/[familyId]/members
Response: User[]

// Get family trees (aggregated)
GET /api/family/[familyId]/trees
Response: Tree[]

// Get family impact stats
GET /api/family/[familyId]/impact
Response: { totalCO2, totalTrees, totalProduction, countries }

// Remove member (admin only)
DELETE /api/family/[familyId]/members/[userId]
Auth: Admin only

// Leave family (self)
POST /api/family/[familyId]/leave
Auth: Required
```

### 3.5 Update Sidebar Navigation

Add new item to dashboard sidebar:

```typescript
// app/[locale]/dashboard/components/Sidebar.tsx

{user.familyId && (
  <SidebarItem
    href="/dashboard/family"
    icon="👨‍👩‍👧‍👦"
    label={t('sidebar.family')}
  />
)}
```

Translation keys:
```json
{
  "dashboard.sidebar.family": "Familia"
}
```

---

## Phase 4: Character Creation System (★ STAR FEATURE ★)

### 4.1 Character Schema

```typescript
interface Character {
  id: string;
  name: string;

  // Ownership
  createdBy: string; // userId
  familyId?: string; // If created in family context

  // Character Design
  type: 'cacao_warrior' | 'chocolate_fairy' | 'cocoa_guardian' | 'custom';
  appearance: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    outfit: string;
    accessories: string[];
  };

  // Character Traits
  personality: string[];
  skills: string[];
  favoriteChocolate: string;
  origin: string; // País de origen del cacao

  // Story
  backstory: string;
  currentMission?: string;

  // 3D/2D Assets
  avatarUrl: string;
  fullBodyImageUrl?: string;
  model3DUrl?: string; // Future: 3D models

  // Stats (Gamification)
  level: number;
  experience: number;
  badges: Badge[];

  // Visibility
  isPublic: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}
```

### 4.2 Character Creation Interface

**Route:** `/dashboard/family/characters/create`

```typescript
<CharacterCreator>
  {/* Step 1: Choose Base Type */}
  <Step1>
    <h2>Elige el tipo de personaje</h2>
    <CharacterTypeGrid>
      <TypeCard type="cacao_warrior" />
      <TypeCard type="chocolate_fairy" />
      <TypeCard type="cocoa_guardian" />
      <TypeCard type="custom" label="Crear desde cero" />
    </CharacterTypeGrid>
  </Step1>

  {/* Step 2: Customize Appearance */}
  <Step2>
    <h2>Personaliza la apariencia</h2>
    <LivePreview character={characterPreview} />

    <CustomizationPanel>
      <ColorPicker label="Tono de piel" onChange={setSkinTone} />
      <Dropdown label="Estilo de cabello" options={hairStyles} />
      <ColorPicker label="Color de cabello" onChange={setHairColor} />
      <ColorPicker label="Color de ojos" onChange={setEyeColor} />
      <OutfitSelector outfits={availableOutfits} />
      <AccessorySelector accessories={availableAccessories} />
    </CustomizationPanel>
  </Step2>

  {/* Step 3: Character Traits */}
  <Step3>
    <h2>Rasgos de personalidad</h2>
    <input placeholder="Nombre del personaje" />
    <MultiSelect
      label="Personalidad"
      options={['Valiente', 'Curioso', 'Amable', 'Aventurero', 'Sabio']}
    />
    <MultiSelect
      label="Habilidades"
      options={['Cultivador', 'Explorador', 'Artista', 'Científico']}
    />
    <Dropdown
      label="Chocolate favorito"
      options={['Oscuro', 'Con Leche', 'Blanco', 'Ruby']}
    />
    <Dropdown
      label="Origen del cacao"
      options={['Colombia', 'Ecuador', 'Perú', 'Ghana', 'Venezuela']}
    />
  </Step3>

  {/* Step 4: Write Story */}
  <Step4>
    <h2>Historia del personaje</h2>

    {/* AI Story Generator */}
    <AIStoryGenerator>
      <p>¿Quieres ayuda? Usa IA para generar una historia base</p>
      <button onClick={generateStoryWithAI}>
        ✨ Generar Historia con IA
      </button>
    </AIStoryGenerator>

    <RichTextEditor
      placeholder="Escribe la historia de tu personaje..."
      value={backstory}
      onChange={setBackstory}
      maxLength={2000}
    />

    <input
      placeholder="Misión actual (opcional)"
      value={currentMission}
    />
  </Step4>

  {/* Step 5: Review & Save */}
  <Step5>
    <CharacterPreviewCard character={newCharacter} />
    <checkbox>
      Hacer público (otros usuarios podrán ver este personaje)
    </checkbox>
    <button onClick={saveCharacter}>
      Crear Personaje
    </button>
  </Step5>
</CharacterCreator>
```

### 4.3 AI Story Generator Integration

Use OpenAI GPT or similar to generate character stories:

```typescript
async function generateCharacterStory(character: Partial<Character>): Promise<string> {
  const prompt = `
    Genera una historia corta (máximo 300 palabras) para un personaje del universo Chocósfera:

    - Nombre: ${character.name}
    - Tipo: ${character.type}
    - Personalidad: ${character.personality?.join(', ')}
    - Habilidades: ${character.skills?.join(', ')}
    - Origen: ${character.origin}
    - Chocolate favorito: ${character.favoriteChocolate}

    El universo Chocósfera es un mundo mágico donde el cacao es sagrado,
    los árboles tienen espíritu, y los personajes protegen el equilibrio
    entre la naturaleza y la producción ética de chocolate.

    La historia debe ser familiar-friendly, inspiradora y conectada con
    temas de sostenibilidad y justicia social.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.8,
  });

  return response.choices[0].message.content;
}
```

### 4.4 Character Gallery

**Route:** `/dashboard/family/characters`

```typescript
<CharacterGallery>
  <h1>Personajes de la Familia {familyName}</h1>

  <Tabs>
    <Tab label="Nuestros Personajes">
      <CharacterGrid>
        {familyCharacters.map(char => (
          <CharacterCard
            character={char}
            onClick={() => viewCharacter(char.id)}
          />
        ))}
      </CharacterGrid>

      <CreateButton href="/dashboard/family/characters/create">
        + Crear Nuevo Personaje
      </CreateButton>
    </Tab>

    <Tab label="Galería Comunitaria">
      <PublicCharacterGrid>
        {publicCharacters.map(char => (
          <CharacterCard character={char} isPublic />
        ))}
      </PublicCharacterGrid>
    </Tab>
  </Tabs>
</CharacterGallery>
```

### 4.5 Character Detail Page

**Route:** `/dashboard/family/characters/[characterId]`

```typescript
<CharacterDetailPage>
  {/* Hero Section */}
  <CharacterHero>
    <CharacterImage src={character.fullBodyImageUrl} />
    <CharacterInfo>
      <h1>{character.name}</h1>
      <Badge type={character.type} />
      <p>Nivel {character.level}</p>

      {isOwner && (
        <Actions>
          <button onClick={editCharacter}>Editar</button>
          <button onClick={deleteCharacter}>Eliminar</button>
        </Actions>
      )}
    </CharacterInfo>
  </CharacterHero>

  {/* Traits Section */}
  <TraitsSection>
    <h2>Rasgos</h2>
    <TraitsList>
      <Trait icon="🎭" label="Personalidad" value={character.personality} />
      <Trait icon="⚡" label="Habilidades" value={character.skills} />
      <Trait icon="🍫" label="Chocolate favorito" value={character.favoriteChocolate} />
      <Trait icon="🌍" label="Origen" value={character.origin} />
    </TraitsList>
  </TraitsSection>

  {/* Story Section */}
  <StorySection>
    <h2>Historia</h2>
    <StoryText>{character.backstory}</StoryText>

    {character.currentMission && (
      <MissionBox>
        <h3>Misión Actual</h3>
        <p>{character.currentMission}</p>
      </MissionBox>
    )}
  </StorySection>

  {/* Badges Section */}
  <BadgesSection>
    <h2>Logros</h2>
    <BadgeGrid>
      {character.badges.map(badge => (
        <BadgeCard badge={badge} />
      ))}
    </BadgeGrid>
  </BadgesSection>

  {/* Related Characters */}
  <RelatedSection>
    <h2>Otros personajes de la familia</h2>
    <CharacterCarousel characters={siblingCharacters} />
  </RelatedSection>
</CharacterDetailPage>
```

### 4.6 Character API Endpoints

```typescript
// Create character
POST /api/characters/create
Auth: Required
Body: Character (without id, createdAt, updatedAt)
Response: { characterId: string }

// Get character
GET /api/characters/[characterId]
Response: Character

// Update character
PATCH /api/characters/[characterId]
Auth: Required (owner only)
Body: Partial<Character>

// Delete character
DELETE /api/characters/[characterId]
Auth: Required (owner only)

// List family characters
GET /api/family/[familyId]/characters
Response: Character[]

// List public characters (for gallery)
GET /api/characters/public
Query: ?page=1&limit=20&type=all
Response: { characters: Character[], total: number }

// Generate story with AI
POST /api/characters/generate-story
Auth: Required
Body: Partial<Character>
Response: { story: string }

// Award badge to character (gamification)
POST /api/characters/[characterId]/badges
Auth: System or Admin
Body: { badgeId: string }
```

---

## Phase 5: Story System

### 5.1 Story Schema

```typescript
interface Story {
  id: string;
  title: string;
  content: string; // Rich text / Markdown

  // Authorship
  authorUserId: string;
  familyId?: string;

  // Characters involved
  characterIds: string[];

  // Story metadata
  genre: 'adventure' | 'mystery' | 'comedy' | 'educational';
  ageRating: 'all' | '7+' | '12+';

  // Media
  coverImageUrl?: string;
  illustrations: string[];

  // Engagement
  views: number;
  likes: number;
  comments: Comment[];

  // Publishing
  status: 'draft' | 'published';
  isPublic: boolean;

  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}
```

### 5.2 Story Creation Interface

**Route:** `/dashboard/family/stories/create`

```typescript
<StoryCreator>
  <StoryHeader>
    <input placeholder="Título de la historia" />
    <select name="genre">
      <option>Aventura</option>
      <option>Misterio</option>
      <option>Comedia</option>
      <option>Educativo</option>
    </select>
  </StoryHeader>

  <CharacterSelector>
    <h3>Personajes en esta historia</h3>
    <MultiSelect
      options={familyCharacters}
      renderOption={(char) => (
        <CharacterOption>
          <Avatar src={char.avatarUrl} />
          <span>{char.name}</span>
        </CharacterOption>
      )}
      onChange={setSelectedCharacters}
    />
  </CharacterSelector>

  <StoryEditor>
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Escribe tu historia aquí..."
      plugins={[
        'headings',
        'bold',
        'italic',
        'lists',
        'links',
        'images',
        'ai-assistant'
      ]}
    />
  </StoryEditor>

  <IllustrationSection>
    <h3>Ilustraciones</h3>
    <ImageUploader
      onUpload={addIllustration}
      acceptedFormats={['jpg', 'png', 'webp']}
    />
    <AIImageGenerator>
      <button onClick={generateIllustration}>
        ✨ Generar ilustración con IA
      </button>
    </AIImageGenerator>
  </IllustrationSection>

  <PublishSection>
    <checkbox name="isPublic">
      Publicar en la comunidad (otros podrán leer tu historia)
    </checkbox>

    <Actions>
      <button onClick={saveDraft}>Guardar Borrador</button>
      <button onClick={publish}>Publicar Historia</button>
    </Actions>
  </PublishSection>
</StoryCreator>
```

### 5.3 Story Library

**Route:** `/dashboard/family/stories`

```typescript
<StoryLibrary>
  <h1>Historias de la Familia</h1>

  <Tabs>
    <Tab label="Nuestras Historias">
      <StoryGrid>
        {familyStories.map(story => (
          <StoryCard
            story={story}
            onClick={() => readStory(story.id)}
          />
        ))}
      </StoryGrid>

      <CreateButton href="/dashboard/family/stories/create">
        + Escribir Nueva Historia
      </CreateButton>
    </Tab>

    <Tab label="Comunidad">
      <PublicStoryFeed>
        {publicStories.map(story => (
          <StoryCard story={story} />
        ))}
      </PublicStoryFeed>
    </Tab>
  </Tabs>
</StoryLibrary>
```

### 5.4 Story Reading Page

**Route:** `/dashboard/family/stories/[storyId]`

```typescript
<StoryReader>
  <StoryCover src={story.coverImageUrl} />

  <StoryHeader>
    <h1>{story.title}</h1>
    <AuthorInfo>
      <Avatar src={author.avatarUrl} />
      <span>Por {author.nick}</span>
      <span>{story.publishedAt.toLocaleDateString()}</span>
    </AuthorInfo>
    <GenreBadge>{story.genre}</GenreBadge>
  </StoryHeader>

  <CharactersList>
    <h3>Personajes</h3>
    {story.characters.map(char => (
      <CharacterChip character={char} />
    ))}
  </CharactersList>

  <StoryContent>
    <RichTextRenderer content={story.content} />

    {story.illustrations.map((img, idx) => (
      <Illustration key={idx} src={img} />
    ))}
  </StoryContent>

  <EngagementSection>
    <LikeButton
      likes={story.likes}
      onLike={handleLike}
      isLiked={userHasLiked}
    />
    <ShareButton story={story} />
    <ViewCount>{story.views} lecturas</ViewCount>
  </EngagementSection>

  <CommentsSection>
    <h3>Comentarios ({story.comments.length})</h3>
    <CommentList comments={story.comments} />

    {user && (
      <CommentForm onSubmit={addComment} />
    )}
  </CommentsSection>

  <RelatedStories>
    <h3>Historias relacionadas</h3>
    <StoryCarousel stories={relatedStories} />
  </RelatedStories>
</StoryReader>
```

---

## Phase 6: Gamification & Rewards

### 6.1 Badge System

```typescript
// Predefined badges
const BADGES = {
  FIRST_TREE: {
    name: 'Primer Árbol',
    description: 'Adoptaste tu primer árbol de cacao',
    icon: '🌱',
  },
  FAMILY_CREATOR: {
    name: 'Fundador Familiar',
    description: 'Creaste un perfil familiar',
    icon: '👨‍👩‍👧‍👦',
  },
  CHARACTER_ARTIST: {
    name: 'Artista de Personajes',
    description: 'Creaste tu primer personaje',
    icon: '🎨',
  },
  STORYTELLER: {
    name: 'Contador de Historias',
    description: 'Publicaste tu primera historia',
    icon: '📖',
  },
  ECO_WARRIOR: {
    name: 'Guerrero Ecológico',
    description: 'Compensaste 1 tonelada de CO₂',
    icon: '🌍',
  },
  VERIFIED_ADULT: {
    name: 'Adulto Verificado',
    description: 'Completaste la verificación KYC',
    icon: '✅',
  },
};
```

### 6.2 Experience & Levels

```typescript
// Users and characters gain XP for actions
const XP_REWARDS = {
  ADOPT_TREE: 50,
  CREATE_CHARACTER: 100,
  PUBLISH_STORY: 150,
  COMPLETE_KYC: 200,
  INVITE_FAMILY_MEMBER: 75,
  DAILY_LOGIN: 10,
  SHARE_STORY: 25,
};

function calculateLevel(xp: number): number {
  // Level 1: 0-100 XP
  // Level 2: 100-250 XP
  // Level 3: 250-500 XP
  // Formula: level = floor(sqrt(xp / 50))
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}
```

### 6.3 Leaderboards

```typescript
// Family leaderboard
GET /api/leaderboards/families
Response: {
  families: Array<{
    rank: number,
    familyId: string,
    familyName: string,
    totalXP: number,
    totalTrees: number,
    totalCO2: number
  }>
}

// Character leaderboard
GET /api/leaderboards/characters
Response: {
  characters: Array<{
    rank: number,
    characterId: string,
    name: string,
    level: number,
    xp: number
  }>
}
```

---

## Implementation Timeline

### Phase 1: Foundation (4-6 weeks)
- [ ] Week 1-2: Database setup, User authentication backend
- [ ] Week 3: User status system & default "minor" logic
- [ ] Week 4: API endpoints for auth (register, login, session)
- [ ] Week 5-6: Integration with frontend, testing

### Phase 1.5: Invitations (2-3 weeks)
- [ ] Week 7: Invitation schema & database
- [ ] Week 8: Email invitation flow (send, validate, accept)
- [ ] Week 9: UI components for invitations, testing

### Phase 2: KYC System (3-4 weeks)
- [ ] Week 10-11: KYC document upload & storage (S3/R2)
- [ ] Week 12: KYC verification logic & admin review panel
- [ ] Week 13: Status upgrade flow (minor → adult)
- [ ] Week 14: Testing & security audit

### Phase 3: Family Profiles (3-4 weeks)
- [ ] Week 15: Family schema & creation API
- [ ] Week 16: Family dashboard UI (/dashboard/family)
- [ ] Week 17: Family member management & aggregated stats
- [ ] Week 18: Testing & polish

### Phase 4: Character Creation (5-6 weeks)
- [ ] Week 19-20: Character schema & API
- [ ] Week 21-22: Character creation wizard UI
- [ ] Week 23: AI story generator integration
- [ ] Week 24: Character gallery & detail pages
- [ ] Week 25: Testing & refinements

### Phase 5: Story System (4-5 weeks)
- [ ] Week 26-27: Story schema & API
- [ ] Week 28-29: Story creation editor (rich text)
- [ ] Week 30: Story library & reading interface
- [ ] Week 31: Comments & engagement features

### Phase 6: Gamification (2-3 weeks)
- [ ] Week 32: Badge system implementation
- [ ] Week 33: XP & leveling logic
- [ ] Week 34: Leaderboards

**Total: ~34 weeks (8 months)**

---

## Technical Stack Recommendations

### Backend
- **Framework:** Next.js API Routes (already in use)
- **Database:** PostgreSQL (relational data, ACID compliance)
- **ORM:** Prisma (type-safe, great DX)
- **Authentication:** NextAuth.js or custom JWT
- **File Storage:** AWS S3 or Cloudflare R2 (for images, documents)
- **Email:** SendGrid or AWS SES (for invitations, notifications)

### Frontend
- **Framework:** Next.js 15 + React (already in use)
- **Styling:** Tailwind CSS (already in use)
- **State Management:** React Context or Zustand
- **Forms:** React Hook Form + Zod validation
- **Rich Text Editor:** TipTap or Lexical
- **Image Upload:** react-dropzone + next/image

### AI Integration
- **Story Generation:** OpenAI GPT-4 API
- **Image Generation:** DALL-E 3 or Stable Diffusion
- **Moderation:** OpenAI Moderation API (for user-generated content)

### Infrastructure
- **Hosting:** Vercel (already using Next.js)
- **CDN:** Cloudflare (for images, assets)
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Plausible or Mixpanel

---

## Security Considerations

### 1. Data Protection
- Encrypt KYC documents at rest (AES-256)
- Use HTTPS for all communication
- Implement CORS policies
- Rate limiting on sensitive endpoints (KYC, invitations)

### 2. Privacy
- GDPR compliance (user data export, deletion)
- Parental consent for minors (COPPA compliance)
- Clear privacy policy
- Data retention policies (auto-delete old KYC docs)

### 3. Content Moderation
- AI moderation for user-generated stories
- Report/flag system for inappropriate content
- Human review queue for flagged content
- Age-appropriate content filters

### 4. Access Control
- Row-level security (users can only see their family data)
- Role-based access (admin, family_admin, member)
- JWT token expiration & refresh
- Secure session management

---

## UX Considerations

### 1. Onboarding Flow
```
1. User registers → Default to "minor" status
2. Welcome screen explains features available for minors
3. Prompt to "Invite your parent to unlock family features"
4. Tutorial on how to adopt first tree
5. Gamification: Award "First Steps" badge
```

### 2. Family Onboarding
```
1. Parent accepts invitation
2. Parent completes KYC (if not already adult)
3. Family profile is created
4. Tutorial on character creation
5. Encourage creating first family character together
```

### 3. Character Creation UX
- **Progressive disclosure:** Start simple, advanced options later
- **Live preview:** See character update in real-time
- **Templates:** Offer pre-made templates for quick start
- **Undo/Redo:** Allow experimentation without fear
- **Save drafts:** Don't lose progress

### 4. Mobile Responsiveness
- All interfaces must work on mobile (primary device for many users)
- Touch-friendly character customization
- Mobile-optimized story reading experience
- Progressive Web App (PWA) for offline access

---

## Internationalization

### Add New Translation Keys

```json
// messages/es.json
{
  "dashboard": {
    "family": {
      "title": "Familia",
      "createFamily": "Crear Perfil Familiar",
      "inviteParent": "Invitar a mi padre/madre",
      "inviteSent": "Invitación enviada",
      "familyMembers": "Miembros de la Familia",
      "familyTrees": "Árboles Familiares",
      "familyImpact": "Impacto Familiar"
    },
    "characters": {
      "title": "Personajes",
      "createCharacter": "Crear Personaje",
      "characterGallery": "Galería de Personajes",
      "characterName": "Nombre del Personaje",
      "appearance": "Apariencia",
      "personality": "Personalidad",
      "skills": "Habilidades",
      "backstory": "Historia de Fondo",
      "generateStory": "Generar Historia con IA"
    },
    "stories": {
      "title": "Historias",
      "writeStory": "Escribir Historia",
      "myStories": "Mis Historias",
      "communityStories": "Historias de la Comunidad",
      "readMore": "Leer más",
      "publish": "Publicar",
      "saveDraft": "Guardar Borrador"
    },
    "kyc": {
      "title": "Verificación de Edad",
      "subtitle": "Verifica que eres mayor de edad para desbloquear todas las funciones",
      "uploadDocument": "Subir Documento",
      "pending": "Verificación en proceso",
      "approved": "Cuenta verificada",
      "rejected": "Verificación rechazada"
    }
  }
}
```

Similar translations for `en.json`, `it.json`, etc.

---

## Metrics & Analytics

### Key Metrics to Track

1. **User Engagement**
   - Daily/Monthly Active Users (DAU/MAU)
   - Average session duration
   - Feature adoption rates (family creation, character creation, stories)

2. **Conversion Funnels**
   - Registration → First tree adoption
   - Minor → Adult verification (KYC completion rate)
   - Single user → Family profile creation
   - Character creation → Story publication

3. **Content Creation**
   - Characters created per day
   - Stories published per day
   - Average story length
   - Public vs private content ratio

4. **Family Metrics**
   - Average family size
   - Invitation acceptance rate
   - Family retention rate
   - Family vs individual tree adoption

5. **Business Metrics**
   - Tree adoptions per user segment (minor, adult, family)
   - Revenue per family vs individual
   - ChocoCoins usage in families
   - Marketplace conversion rate

---

## Future Enhancements (Post-MVP)

### 1. Mobile Apps
- Native iOS/Android apps for better mobile experience
- Push notifications for family activities
- Offline mode for story reading

### 2. Advanced Character Features
- 3D character models (Three.js/Babylon.js)
- Character animations
- Character "evolution" based on tree growth
- Character trading cards (NFTs?)

### 3. Collaborative Storytelling
- Multi-author stories
- Real-time collaborative editing (like Google Docs)
- Story branching (choose-your-own-adventure)
- Audio narration (text-to-speech or voice recording)

### 4. Educational Content
- Lessons about cacao farming
- Environmental impact modules
- Coding tutorials (tie into character creation)
- Family challenges & quests

### 5. Social Features
- Family messaging/chat
- Activity feed ("Dad adopted a new tree!")
- Achievements & milestones
- Photo albums (family trip to cacao farm?)

### 6. Marketplace Integration
- Buy character outfits/accessories with ChocoCoins
- Limited edition character items
- Story illustration commissions from artists
- Physical merchandise of user characters

### 7. Augmented Reality (AR)
- AR view of adopted trees
- Place characters in real world (AR camera)
- Virtual family photo with characters

---

## Conclusion

This roadmap outlines the complete **Character Creation & Family Profiles System**, which is the star functionality of Chocósfera. The system includes:

✅ **User Status System** - Default minors, KYC for adults
✅ **Invitation Flow** - Minors can invite parents via email
✅ **Family Profiles** - Collaborative family dashboard
✅ **Character Creation** - AI-powered character builder
✅ **Story System** - Publish and share family stories
✅ **Gamification** - Badges, XP, levels, leaderboards

**Implementation Priority:**
1. Phase 1: Authentication & User Status (CRITICAL)
2. Phase 1.5: Invitation System (HIGH)
3. Phase 2: KYC System (HIGH)
4. Phase 3: Family Profiles (HIGH)
5. Phase 4: Character Creation (STAR FEATURE - HIGH)
6. Phase 5: Story System (MEDIUM)
7. Phase 6: Gamification (NICE-TO-HAVE)

**Estimated Timeline:** 8-9 months for full implementation

This document serves as the technical specification and implementation guide for future development.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-14
**Status:** Roadmap - Not yet implemented
**Next Steps:** Begin Phase 1 (Authentication & User Status System)
