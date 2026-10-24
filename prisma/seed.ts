import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { name: 'Fiction', slug: 'fiction', description: 'Literary fiction, contemporary and classic novels.' },
  { name: 'Non-Fiction', slug: 'non-fiction', description: 'Biographies, memoirs, essays and reportage.' },
  { name: 'Science Fiction', slug: 'science-fiction', description: 'Speculative, dystopian and space opera.' },
  { name: 'Mystery & Thriller', slug: 'mystery-thriller', description: 'Crime, suspense and psychological thrillers.' },
  { name: 'History', slug: 'history', description: 'World history, social history and political history.' },
  { name: 'Philosophy', slug: 'philosophy', description: 'Classic and contemporary philosophical works.' },
  { name: 'Biography', slug: 'biography', description: 'Inspiring life stories of notable figures.' },
  { name: 'Self-Help', slug: 'self-help', description: 'Personal development, productivity and wellness.' },
  { name: 'Children', slug: 'children', description: 'Picture books, middle grade and young adult.' },
  { name: 'Poetry', slug: 'poetry', description: 'Classic and modern poetry collections.' },
]

const authors = [
  { name: 'Gabriel García Márquez', bio: 'Colombian novelist, Nobel Prize laureate, pioneer of magical realism.' },
  { name: 'Toni Morrison', bio: 'American novelist and Nobel Prize winner, known for Beloved and Song of Solomon.' },
  { name: 'George Orwell', bio: 'English novelist and essayist, author of Nineteen Eighty-Four and Animal Farm.' },
  { name: 'Ursula K. Le Guin', bio: 'American author of speculative fiction, feminist science fiction pioneer.' },
  { name: 'Chimamanda Ngozi Adichie', bio: 'Nigerian author and feminist, known for Americanah and Half of a Yellow Sun.' },
  { name: 'Haruki Murakami', bio: 'Japanese author known for surreal, introspective novels.' },
  { name: 'Isabel Allende', bio: 'Chilean-American author known for rich, magical storytelling.' },
  { name: 'Kazuo Ishiguro', bio: 'British novelist and Nobel laureate, author of The Remains of the Day.' },
  { name: 'Donna Tartt', bio: 'American novelist best known for The Secret History and The Goldfinch.' },
  { name: 'Colson Whitehead', bio: 'American author and Pulitzer Prize winner, known for The Underground Railroad.' },
  { name: 'Elena Ferrante', bio: 'Pseudonymous Italian author of the Neapolitan Novels series.' },
  { name: 'Sally Rooney', bio: 'Irish novelist known for Normal People and Conversations with Friends.' },
  { name: 'Yuval Noah Harari', bio: 'Israeli historian and author of Sapiens, Homo Deus and 21 Lessons.' },
  { name: 'Michelle Obama', bio: 'Former US First Lady and bestselling memoirist.' },
  { name: 'Walter Isaacson', bio: 'American biographer of figures including Einstein, Jobs and da Vinci.' },
]

type BookSeed = {
  title: string
  slug: string
  authorName: string
  categoryNames: string[]
  description: string
  price: number
  compareAtPrice?: number
  pages: number
  publisher: string
  publishedAt: Date
  featured: boolean
  bestseller: boolean
  stock: number
  coverUrl: string | null
}

const books: BookSeed[] = [
  {
    title: 'One Hundred Years of Solitude',
    slug: 'one-hundred-years-of-solitude',
    authorName: 'Gabriel García Márquez',
    categoryNames: ['Fiction'],
    description: 'The epic story of the Buendía family across seven generations in the fictional town of Macondo. A landmark of magical realism and Latin American literature.',
    price: 16.99,
    compareAtPrice: 19.99,
    pages: 417,
    publisher: 'Harper Perennial',
    publishedAt: new Date('1967-05-30'),
    featured: true,
    bestseller: true,
    stock: 42,
    coverUrl: null,
  },
  {
    title: 'Beloved',
    slug: 'beloved',
    authorName: 'Toni Morrison',
    categoryNames: ['Fiction'],
    description: 'A haunting novel about the aftermath of slavery, exploring memory, trauma and the meaning of freedom through the story of Sethe.',
    price: 15.99,
    pages: 324,
    publisher: 'Vintage',
    publishedAt: new Date('1987-09-02'),
    featured: true,
    bestseller: true,
    stock: 35,
    coverUrl: null,
  },
  {
    title: 'Nineteen Eighty-Four',
    slug: 'nineteen-eighty-four',
    authorName: 'George Orwell',
    categoryNames: ['Fiction', 'Science Fiction'],
    description: 'A dystopian social science fiction novel set in a totalitarian superstate. Winston Smith struggles against the Party and its all-seeing surveillance apparatus, Big Brother.',
    price: 13.99,
    compareAtPrice: 16.99,
    pages: 328,
    publisher: 'Penguin Books',
    publishedAt: new Date('1949-06-08'),
    featured: false,
    bestseller: true,
    stock: 60,
    coverUrl: null,
  },
  {
    title: 'The Left Hand of Darkness',
    slug: 'the-left-hand-of-darkness',
    authorName: 'Ursula K. Le Guin',
    categoryNames: ['Science Fiction'],
    description: 'A groundbreaking science fiction novel exploring gender and society on the planet Gethen, where inhabitants have no fixed sex.',
    price: 14.99,
    pages: 304,
    publisher: 'Ace Books',
    publishedAt: new Date('1969-03-01'),
    featured: true,
    bestseller: false,
    stock: 28,
    coverUrl: null,
  },
  {
    title: 'Americanah',
    slug: 'americanah',
    authorName: 'Chimamanda Ngozi Adichie',
    categoryNames: ['Fiction'],
    description: 'A sweeping novel about race, identity and belonging, following Ifemelu as she moves from Nigeria to America and grapples with what it means to be Black in the United States.',
    price: 16.99,
    compareAtPrice: 18.99,
    pages: 477,
    publisher: 'Anchor Books',
    publishedAt: new Date('2013-05-14'),
    featured: true,
    bestseller: true,
    stock: 50,
    coverUrl: null,
  },
  {
    title: 'Norwegian Wood',
    slug: 'norwegian-wood',
    authorName: 'Haruki Murakami',
    categoryNames: ['Fiction'],
    description: 'A nostalgic story of loss and sexuality set in 1960s Tokyo. Toru Watanabe looks back on his days as a student and his relationship with two very different women.',
    price: 15.99,
    pages: 296,
    publisher: 'Vintage International',
    publishedAt: new Date('1987-09-04'),
    featured: false,
    bestseller: true,
    stock: 44,
    coverUrl: null,
  },
  {
    title: 'The House of the Spirits',
    slug: 'the-house-of-the-spirits',
    authorName: 'Isabel Allende',
    categoryNames: ['Fiction'],
    description: 'A multigenerational saga of the Trueba family in Chile, blending magical realism with political history.',
    price: 16.99,
    pages: 433,
    publisher: 'Bantam Books',
    publishedAt: new Date('1982-10-10'),
    featured: false,
    bestseller: false,
    stock: 30,
    coverUrl: null,
  },
  {
    title: 'The Remains of the Day',
    slug: 'the-remains-of-the-day',
    authorName: 'Kazuo Ishiguro',
    categoryNames: ['Fiction'],
    description: 'An ageing English butler reflects on his years of service and the choices that defined his life. A Booker Prize-winning meditation on dignity, duty and regret.',
    price: 14.99,
    pages: 258,
    publisher: 'Vintage International',
    publishedAt: new Date('1989-05-01'),
    featured: true,
    bestseller: false,
    stock: 25,
    coverUrl: null,
  },
  {
    title: 'The Secret History',
    slug: 'the-secret-history',
    authorName: 'Donna Tartt',
    categoryNames: ['Fiction', 'Mystery & Thriller'],
    description: 'A small group of classical Greek students at a Vermont college become entangled in murder, obsession and moral collapse. A compelling dark academia debut.',
    price: 17.99,
    compareAtPrice: 20.99,
    pages: 559,
    publisher: 'Vintage',
    publishedAt: new Date('1992-09-16'),
    featured: true,
    bestseller: true,
    stock: 38,
    coverUrl: null,
  },
  {
    title: 'The Underground Railroad',
    slug: 'the-underground-railroad',
    authorName: 'Colson Whitehead',
    categoryNames: ['Fiction', 'History'],
    description: 'A Pulitzer Prize-winning novel reimagining the underground railroad as a literal network of secret tunnels, following Cora on her escape from a Georgia plantation.',
    price: 15.99,
    pages: 306,
    publisher: 'Doubleday',
    publishedAt: new Date('2016-08-02'),
    featured: false,
    bestseller: true,
    stock: 40,
    coverUrl: null,
  },
  {
    title: "My Brilliant Friend",
    slug: 'my-brilliant-friend',
    authorName: 'Elena Ferrante',
    categoryNames: ['Fiction'],
    description: 'The first book in the Neapolitan Novels. A rich, intense and generous-hearted story about two friends, Elena and Lila, growing up in Naples in the 1950s.',
    price: 16.99,
    compareAtPrice: 18.00,
    pages: 331,
    publisher: 'Europa Editions',
    publishedAt: new Date('2011-10-01'),
    featured: true,
    bestseller: true,
    stock: 55,
    coverUrl: null,
  },
  {
    title: 'Normal People',
    slug: 'normal-people',
    authorName: 'Sally Rooney',
    categoryNames: ['Fiction'],
    description: 'A story about the complicated, shifting relationship between two Irish students, Connell and Marianne, from secondary school to university.',
    price: 14.99,
    compareAtPrice: 16.99,
    pages: 273,
    publisher: 'Faber & Faber',
    publishedAt: new Date('2018-08-30'),
    featured: false,
    bestseller: true,
    stock: 62,
    coverUrl: null,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    slug: 'sapiens',
    authorName: 'Yuval Noah Harari',
    categoryNames: ['Non-Fiction', 'History'],
    description: 'A sweeping survey of human history from the Stone Age to the present, exploring how Homo sapiens came to dominate the Earth.',
    price: 18.99,
    compareAtPrice: 22.99,
    pages: 443,
    publisher: 'Harper',
    publishedAt: new Date('2011-01-01'),
    featured: true,
    bestseller: true,
    stock: 75,
    coverUrl: null,
  },
  {
    title: 'Becoming',
    slug: 'becoming',
    authorName: 'Michelle Obama',
    categoryNames: ['Non-Fiction', 'Biography'],
    description: "An intimate, powerful memoir by the former First Lady of the United States, chronicling her journey from Chicago's South Side to the White House.",
    price: 19.99,
    compareAtPrice: 24.99,
    pages: 426,
    publisher: 'Crown',
    publishedAt: new Date('2018-11-13'),
    featured: true,
    bestseller: true,
    stock: 80,
    coverUrl: null,
  },
  {
    title: 'Steve Jobs',
    slug: 'steve-jobs',
    authorName: 'Walter Isaacson',
    categoryNames: ['Non-Fiction', 'Biography'],
    description: 'The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs himself as well as interviews with family, friends, adversaries, competitors and colleagues.',
    price: 21.99,
    compareAtPrice: 26.99,
    pages: 630,
    publisher: 'Simon & Schuster',
    publishedAt: new Date('2011-10-24'),
    featured: false,
    bestseller: true,
    stock: 45,
    coverUrl: null,
  },
  {
    title: 'Animal Farm',
    slug: 'animal-farm',
    authorName: 'George Orwell',
    categoryNames: ['Fiction'],
    description: 'A satirical allegorical novella reflecting events leading up to the Russian Revolution and the Stalinist era, told through the story of a farm animal rebellion.',
    price: 10.99,
    pages: 112,
    publisher: 'Signet Classics',
    publishedAt: new Date('1945-08-17'),
    featured: false,
    bestseller: false,
    stock: 50,
    coverUrl: null,
  },
  {
    title: 'Kafka on the Shore',
    slug: 'kafka-on-the-shore',
    authorName: 'Haruki Murakami',
    categoryNames: ['Fiction', 'Mystery & Thriller'],
    description: 'Two parallel narratives converge: a teenage boy running away from home and an old man who can talk to cats. Surreal, philosophical and hypnotic.',
    price: 16.99,
    pages: 505,
    publisher: 'Vintage International',
    publishedAt: new Date('2002-09-12'),
    featured: false,
    bestseller: false,
    stock: 32,
    coverUrl: null,
  },
  {
    title: 'Never Let Me Go',
    slug: 'never-let-me-go',
    authorName: 'Kazuo Ishiguro',
    categoryNames: ['Fiction', 'Science Fiction'],
    description: 'Kathy, Ruth and Tommy grow up at Hailsham, a seemingly idyllic English boarding school, unaware of the dark fate that awaits them. A haunting dystopian masterpiece.',
    price: 15.99,
    pages: 288,
    publisher: 'Vintage International',
    publishedAt: new Date('2005-04-05'),
    featured: false,
    bestseller: true,
    stock: 28,
    coverUrl: null,
  },
  {
    title: 'The Goldfinch',
    slug: 'the-goldfinch',
    authorName: 'Donna Tartt',
    categoryNames: ['Fiction'],
    description: 'A Pulitzer Prize-winning novel tracing the life of Theo Decker from the day a terrorist bombing kills his mother, through crime, addiction and art.',
    price: 18.99,
    compareAtPrice: 21.99,
    pages: 771,
    publisher: 'Little, Brown',
    publishedAt: new Date('2013-10-22'),
    featured: false,
    bestseller: true,
    stock: 36,
    coverUrl: null,
  },
  {
    title: 'Half of a Yellow Sun',
    slug: 'half-of-a-yellow-sun',
    authorName: 'Chimamanda Ngozi Adichie',
    categoryNames: ['Fiction', 'History'],
    description: 'Set in Nigeria during the Biafran War, this novel follows three characters whose lives are intertwined through love, survival and the horrors of civil conflict.',
    price: 16.99,
    pages: 433,
    publisher: 'Anchor Books',
    publishedAt: new Date('2006-09-12'),
    featured: false,
    bestseller: false,
    stock: 30,
    coverUrl: null,
  },
  {
    title: 'Homo Deus: A Brief History of Tomorrow',
    slug: 'homo-deus',
    authorName: 'Yuval Noah Harari',
    categoryNames: ['Non-Fiction', 'Philosophy'],
    description: 'A provocative look at the future of humanity: what will happen when algorithms know us better than we know ourselves?',
    price: 17.99,
    compareAtPrice: 21.99,
    pages: 462,
    publisher: 'Harper',
    publishedAt: new Date('2015-09-08'),
    featured: false,
    bestseller: true,
    stock: 55,
    coverUrl: null,
  },
  {
    title: 'The Dispossessed',
    slug: 'the-dispossessed',
    authorName: 'Ursula K. Le Guin',
    categoryNames: ['Science Fiction', 'Philosophy'],
    description: 'An ambiguous utopia: a physicist from an anarchist society travels to the neighbouring capitalist world in search of scientific knowledge and mutual understanding.',
    price: 14.99,
    pages: 341,
    publisher: 'Avon',
    publishedAt: new Date('1974-05-01'),
    featured: false,
    bestseller: false,
    stock: 22,
    coverUrl: null,
  },
  {
    title: 'Conversations with Friends',
    slug: 'conversations-with-friends',
    authorName: 'Sally Rooney',
    categoryNames: ['Fiction'],
    description: 'Frances, a college student in Dublin, navigates complex relationships and moral ambiguity in this debut novel about desire, vulnerability and self-knowledge.',
    price: 14.99,
    pages: 304,
    publisher: 'Faber & Faber',
    publishedAt: new Date('2017-05-04'),
    featured: false,
    bestseller: false,
    stock: 40,
    coverUrl: null,
  },
  {
    title: 'Song of Solomon',
    slug: 'song-of-solomon',
    authorName: 'Toni Morrison',
    categoryNames: ['Fiction'],
    description: 'Milkman Dead journeys through the American South seeking his identity and heritage. A rich exploration of African American mythology and family history.',
    price: 15.99,
    pages: 337,
    publisher: 'Vintage International',
    publishedAt: new Date('1977-09-01'),
    featured: false,
    bestseller: false,
    stock: 28,
    coverUrl: null,
  },
  {
    title: 'The Nickel Boys',
    slug: 'the-nickel-boys',
    authorName: 'Colson Whitehead',
    categoryNames: ['Fiction', 'History'],
    description: 'A devastating story of two boys at a reform school in Jim Crow-era Florida. Winner of the Pulitzer Prize for Fiction 2020.',
    price: 14.99,
    pages: 224,
    publisher: 'Doubleday',
    publishedAt: new Date('2019-07-16'),
    featured: false,
    bestseller: true,
    stock: 38,
    coverUrl: null,
  },
  {
    title: 'Those Who Leave and Those Who Stay',
    slug: 'those-who-leave-and-those-who-stay',
    authorName: 'Elena Ferrante',
    categoryNames: ['Fiction'],
    description: 'The third Neapolitan Novel. Elena and Lila\'s paths diverge through the turbulent 1970s, each finding themselves on opposite sides of a widening class divide.',
    price: 16.99,
    pages: 418,
    publisher: 'Europa Editions',
    publishedAt: new Date('2013-09-01'),
    featured: false,
    bestseller: false,
    stock: 25,
    coverUrl: null,
  },
  {
    title: 'Love in the Time of Cholera',
    slug: 'love-in-the-time-of-cholera',
    authorName: 'Gabriel García Márquez',
    categoryNames: ['Fiction'],
    description: 'An exploration of love in its many forms: romantic, familial and erotic. A man waits more than fifty years for the woman he loves to be free.',
    price: 16.99,
    pages: 348,
    publisher: 'Vintage International',
    publishedAt: new Date('1985-01-01'),
    featured: false,
    bestseller: true,
    stock: 35,
    coverUrl: null,
  },
  {
    title: 'Einstein: His Life and Universe',
    slug: 'einstein-his-life-and-universe',
    authorName: 'Walter Isaacson',
    categoryNames: ['Non-Fiction', 'Biography'],
    description: 'A riveting biography drawing on newly released Einstein archives to show how his imagination and rebelliousness led to his genius.',
    price: 19.99,
    compareAtPrice: 23.99,
    pages: 675,
    publisher: 'Simon & Schuster',
    publishedAt: new Date('2007-04-10'),
    featured: false,
    bestseller: false,
    stock: 30,
    coverUrl: null,
  },
  {
    title: 'The Earthsea Cycle',
    slug: 'the-earthsea-cycle',
    authorName: 'Ursula K. Le Guin',
    categoryNames: ['Science Fiction', 'Children'],
    description: 'Ged, a young boy from a poor village, discovers he has unusual powers and becomes one of the greatest wizards of the archipelago world of Earthsea.',
    price: 15.99,
    pages: 297,
    publisher: 'Houghton Mifflin',
    publishedAt: new Date('1968-11-01'),
    featured: false,
    bestseller: false,
    stock: 20,
    coverUrl: null,
  },
  {
    title: "We Should All Be Feminists",
    slug: 'we-should-all-be-feminists',
    authorName: 'Chimamanda Ngozi Adichie',
    categoryNames: ['Non-Fiction', 'Philosophy'],
    description: 'Adapted from Adichie\'s famous TEDx talk, this essay defines feminism for the twenty-first century and argues why every individual benefits from gender equality.',
    price: 9.99,
    pages: 64,
    publisher: 'Anchor Books',
    publishedAt: new Date('2014-07-29'),
    featured: false,
    bestseller: true,
    stock: 70,
    coverUrl: null,
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.giftPointsTransaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.bookCategory.deleteMany()
  await prisma.book.deleteMany()
  await prisma.category.deleteMany()
  await prisma.author.deleteMany()
  await prisma.address.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create categories
  console.log('  Creating categories...')
  const createdCategories = await Promise.all(
    categories.map((c) => prisma.category.create({ data: c }))
  )
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c]))

  // Create authors
  console.log('  Creating authors...')
  const createdAuthors = await Promise.all(
    authors.map((a) => prisma.author.create({ data: a }))
  )
  const authorMap = new Map(createdAuthors.map((a) => [a.name, a]))

  // Create books
  console.log('  Creating books...')
  for (const book of books) {
    const author = authorMap.get(book.authorName)
    if (!author) {
      console.warn(`  ⚠ Author not found: ${book.authorName}`)
      continue
    }
    const createdBook = await prisma.book.create({
      data: {
        title: book.title,
        slug: book.slug,
        authorId: author.id,
        description: book.description,
        coverUrl: book.coverUrl,
        price: new Prisma.Decimal(book.price),
        compareAtPrice: book.compareAtPrice
          ? new Prisma.Decimal(book.compareAtPrice)
          : undefined,
        pages: book.pages,
        publisher: book.publisher,
        publishedAt: book.publishedAt,
        featured: book.featured,
        bestseller: book.bestseller,
        stock: book.stock,
      },
    })
    // Link categories
    for (const catName of book.categoryNames) {
      const cat = categoryMap.get(catName)
      if (cat) {
        await prisma.bookCategory.create({
          data: { bookId: createdBook.id, categoryId: cat.id },
        })
      }
    }
  }

  // Create demo user
  console.log('  Creating demo user...')
  const hashedPassword = await bcrypt.hash('Demo1234!', 12)
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@chapterandco.com',
      password: hashedPassword,
    },
  })

  // Create address for demo user
  await prisma.address.create({
    data: {
      userId: demoUser.id,
      fullName: 'Demo User',
      line1: '123 Bookshelf Lane',
      city: 'Reading',
      state: 'Berkshire',
      postalCode: 'RG1 1AA',
      country: 'GB',
      isDefault: true,
    },
  })

  // Gift points for demo user
  await prisma.giftPointsTransaction.create({
    data: {
      userId: demoUser.id,
      type: 'EARNED',
      points: 500,
      description: 'Welcome gift points',
    },
  })

  console.log('✅ Seed complete!')
  console.log(`   ${categories.length} categories`)
  console.log(`   ${authors.length} authors`)
  console.log(`   ${books.length} books`)
  console.log('   1 demo user (demo@chapterandco.com / Demo1234!)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
