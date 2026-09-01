/**
 * Demo backend for the GitHub Pages build.
 *
 * The real app talks to a separate REST API (see src/app/config.ts and
 * proxy.conf.json). GitHub Pages serves static files only, so on Pages this
 * functional interceptor answers the very same requests from an in-memory
 * store that is persisted to localStorage. Every screen stays clickable and
 * every create/update/delete survives a refresh.
 *
 * Nothing in src/ is changed to support this: the file is copied into
 * src/app/ by the Pages workflow and registered by demo/app.config.demo.ts.
 *
 * Type `__resetDemo()` in the browser console to wipe the store and reseed.
 */

import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

declare global {
  interface Window {
    __resetDemo?: () => void;
  }
}

const DB_KEY = 'taskman-demo-db';

/* ------------------------------------------------------------------ types */

interface DemoUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface DemoTeam {
  id: number;
  name: string;
  description: string;
  members_count: number;
  created_at: string;
}

interface DemoProject {
  id: number;
  name: string;
  description: string;
  team_id: number;
  teamId: number;
  created_at: string;
}

interface DemoTask {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  project_id: number;
  projectId: number;
  created_at: string;
}

interface DemoComment {
  id: number;
  task_id: number;
  taskId: number;
  body: string;
  author_name: string;
  created_at: string;
}

interface DemoDb {
  seq: number;
  users: DemoUser[];
  teams: DemoTeam[];
  projects: DemoProject[];
  tasks: DemoTask[];
  comments: DemoComment[];
}

/* ------------------------------------------------------- request payloads */

interface AuthBody {
  email?: string;
  password?: string;
  name?: string;
}

interface TeamBody {
  name?: string;
  description?: string;
}

interface ProjectBody {
  name?: string;
  description?: string;
  teamId?: number | string;
  team_id?: number | string;
}

interface TaskBody {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  projectId?: number | string;
  project_id?: number | string;
}

interface CommentBody {
  taskId?: number | string;
  body?: string;
}

/* ------------------------------------------------------------------- seed */

function daysAgo(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seed(): DemoDb {
  const teams: DemoTeam[] = [
    {
      id: 1,
      name: 'צוות פיתוח',
      description: 'פיתוח פרונט וב-אנד של מערכת ניהול המשימות',
      members_count: 5,
      created_at: daysAgo(120),
    },
    {
      id: 2,
      name: 'צוות אוטומציה ו-QA',
      description: 'בדיקות ידניות, אוטומציה ותשתיות CI',
      members_count: 3,
      created_at: daysAgo(95),
    },
  ];

  const projects: DemoProject[] = [
    {
      id: 1,
      name: 'אתר תדמית ללקוחות',
      description: 'עיצוב מחדש של דפי הנחיתה, תמיכה בעברית ובנייד',
      team_id: 1,
      teamId: 1,
      created_at: daysAgo(64),
    },
    {
      id: 2,
      name: 'אפליקציית ניהול משימות',
      description: 'לוח קנבן, הרשאות לפי צוות והתראות בזמן אמת',
      team_id: 1,
      teamId: 1,
      created_at: daysAgo(41),
    },
    {
      id: 3,
      name: 'תשתית בדיקות אוטומטיות',
      description: 'Selenium ו-Vitest, הרצה יומית מול סביבת סטייג׳ינג',
      team_id: 2,
      teamId: 2,
      created_at: daysAgo(28),
    },
    {
      id: 4,
      name: 'מיגרציה לענן',
      description: 'העברת בסיס הנתונים והשרתים לסביבה מנוהלת',
      team_id: 2,
      teamId: 2,
      created_at: daysAgo(12),
    },
  ];

  const tasks: DemoTask[] = [
    // אתר תדמית ללקוחות
    t(1, 1, 'עיצוב דף הבית מחדש', 'סקיצות בפיגמה ואישור מול המנהלת', 'High', 'done', 60),
    t(2, 1, 'התאמה למובייל', 'בדיקת רספונסיביות בכל נקודות השבירה', 'Medium', 'in-progress', 30),
    t(3, 1, 'תמיכה מלאה ב-RTL', 'כיווניות, אייקונים ויישור טקסט בעברית', 'High', 'in-progress', 22),
    t(4, 1, 'טופס יצירת קשר', 'ולידציה בצד לקוח ושליחה למייל התמיכה', 'Medium', 'todo', 15),
    t(5, 1, 'אופטימיזציה של תמונות', 'המרה ל-WebP וטעינה עצלה', 'Low', 'todo', 9),

    // אפליקציית ניהול משימות
    t(6, 2, 'מסך לוח קנבן', 'שלוש עמודות עם גרירה בין סטטוסים', 'High', 'done', 38),
    t(7, 2, 'ניהול הרשאות לפי צוות', 'משתמש רואה רק את הפרויקטים של הצוות שלו', 'High', 'in-progress', 20),
    t(8, 2, 'הערות על משימה', 'שרשור הערות עם שם הכותב ותאריך', 'Medium', 'done', 17),
    t(9, 2, 'התראות בזמן אמת', 'חיבור WebSocket ועדכון הלוח ללא רענון', 'Medium', 'todo', 11),
    t(10, 2, 'ייצוא לוח ל-CSV', 'כפתור הורדה עם כל המשימות הפתוחות', 'Low', 'todo', 6),

    // תשתית בדיקות אוטומטיות
    t(11, 3, 'הקמת פרויקט Selenium', 'מבנה Page Object והרצה מקומית', 'High', 'done', 26),
    t(12, 3, 'בדיקות למסך ההתחברות', 'תרחישים חיוביים ושליליים כולל שדות ריקים', 'High', 'in-progress', 14),
    t(13, 3, 'דוח הרצה יומי', 'שליחת סיכום למייל הצוות בסוף כל ריצה', 'Medium', 'todo', 8),
    t(14, 3, 'חיבור ל-GitHub Actions', 'הרצת הסוויטה על כל Pull Request', 'Medium', 'todo', 5),

    // מיגרציה לענן
    t(15, 4, 'מיפוי שירותים קיימים', 'רשימת תלויות וגרסאות של כל שרת', 'High', 'done', 10),
    t(16, 4, 'העברת בסיס הנתונים', 'גיבוי, שחזור ובדיקת שלמות הנתונים', 'High', 'in-progress', 4),
    t(17, 4, 'ניטור ולוגים', 'הגדרת התראות על שגיאות וזמני תגובה', 'Low', 'todo', 2),
  ];

  const comments: DemoComment[] = [
    c(1, 3, 'שמנו לב שהאייקונים לא מתהפכים בכיווניות הפוכה, צריך תיקון ב-CSS.', 'רותי', 20),
    c(2, 3, 'תוקן בענף feature/rtl-icons, מחכה לסקירת קוד.', 'דנה', 18),
    c(3, 7, 'צריך להחליט אם מנהל צוות רואה גם פרויקטים ארכיוניים.', 'יוסי', 16),
    c(4, 12, 'הוספתי תרחיש של סיסמה קצרה מדי, נופל כמצופה.', 'רותי', 12),
    c(5, 12, 'יופי. תוסיפי בבקשה גם בדיקה לאימייל לא תקין.', 'דנה', 11),
    c(6, 16, 'הגיבוי הושלם, נשאר להריץ השוואת שורות בין הסביבות.', 'יוסי', 3),
  ];

  return {
    seq: 1000,
    users: [{ id: 1, name: 'רותי', email: 'demo@taskmanager.dev', created_at: daysAgo(150) }],
    teams,
    projects,
    tasks,
    comments,
  };
}

function t(
  id: number,
  projectId: number,
  title: string,
  description: string,
  priority: string,
  status: string,
  createdDaysAgo: number,
): DemoTask {
  return {
    id,
    title,
    description,
    priority,
    status,
    project_id: projectId,
    projectId,
    created_at: daysAgo(createdDaysAgo),
  };
}

function c(
  id: number,
  taskId: number,
  bodyText: string,
  author: string,
  createdDaysAgo: number,
): DemoComment {
  return {
    id,
    task_id: taskId,
    taskId,
    body: bodyText,
    author_name: author,
    created_at: daysAgo(createdDaysAgo, 14),
  };
}

/* ------------------------------------------------------------- persistence */

let cache: DemoDb | null = null;

function load(): DemoDb {
  if (cache) {
    return cache;
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      cache = JSON.parse(raw) as DemoDb;
      return cache;
    }
  } catch {
    // A blocked or corrupted localStorage just means we start from the seed.
  }
  cache = seed();
  save(cache);
  return cache;
}

function save(db: DemoDb): void {
  cache = db;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Private-mode browsers still get a working demo, just not across refreshes.
  }
}

function nextId(db: DemoDb): number {
  db.seq += 1;
  return db.seq;
}

/* ------------------------------------------------------------------ helpers */

function ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  const wait = 120 + Math.floor(Math.random() * 130);
  return of(new HttpResponse<unknown>({ status, body })).pipe(delay(wait));
}

function num(value: unknown): number {
  return Number(value);
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/** A JWT-shaped string so anything that inspects the token sees three parts. */
function fakeToken(user: DemoUser): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      demo: true,
    }),
  );
  return `${header}.${payload}.${b64url('github-pages-demo-signature')}`;
}

function b64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface ParsedUrl {
  segments: string[];
  query: URLSearchParams;
}

/**
 * The app builds absolute URLs in production and relative "/api/..." ones in
 * dev, so match on whatever follows the "/api" prefix in either form.
 */
function parse(url: string): ParsedUrl | null {
  const questionMark = url.indexOf('?');
  const rawPath = questionMark >= 0 ? url.slice(0, questionMark) : url;
  const query = new URLSearchParams(questionMark >= 0 ? url.slice(questionMark + 1) : '');

  const marker = rawPath.indexOf('/api/');
  let path: string;
  if (marker >= 0) {
    path = rawPath.slice(marker + '/api'.length);
  } else if (rawPath.endsWith('/api')) {
    path = '';
  } else {
    return null;
  }

  const segments = path.split('/').filter((part) => part.length > 0);
  return { segments, query };
}

/* -------------------------------------------------------------- the routes */

export const demoBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next,
): Observable<HttpEvent<unknown>> => {
  installResetHook();

  // The status widget pings a local health endpoint that is not under /api.
  if (req.url.endsWith('/health')) {
    return ok({ status: 'ok', mode: 'github-pages-demo' });
  }

  const parsed = parse(req.url);
  if (!parsed) {
    return next(req);
  }

  const db = load();
  const [resource, first, second] = parsed.segments;
  const method = req.method.toUpperCase();

  /* ---------------------------------------------------------------- auth */
  if (resource === 'auth') {
    const body = (req.body ?? {}) as AuthBody;

    // Any credentials are accepted: a portfolio visitor should never be
    // stopped at the gate by a password only the author knows.
    if (first === 'login' && method === 'POST') {
      const email = text(body.email, 'demo@taskmanager.dev');
      let user = db.users.find((candidate) => candidate.email === email);
      if (!user) {
        user = {
          id: nextId(db),
          name: email.split('@')[0] || 'Demo User',
          email,
          created_at: new Date().toISOString(),
        };
        db.users.push(user);
        save(db);
      }
      return ok({ token: fakeToken(user), user });
    }

    if (first === 'register' && method === 'POST') {
      const email = text(body.email, 'demo@taskmanager.dev');
      const existing = db.users.find((candidate) => candidate.email === email);
      const user: DemoUser = existing ?? {
        id: nextId(db),
        name: text(body.name, email.split('@')[0] || 'Demo User'),
        email,
        created_at: new Date().toISOString(),
      };
      if (!existing) {
        db.users.push(user);
      } else {
        user.name = text(body.name, user.name);
      }
      save(db);
      return ok({ token: fakeToken(user), user }, 201);
    }

    if (first === 'me' && method === 'GET') {
      const current: DemoUser | undefined = db.users[0];
      return ok(current ? current : null);
    }

    if (first === 'logout' && method === 'POST') {
      return ok({ success: true });
    }
  }

  /* --------------------------------------------------------------- users */
  if (resource === 'users' && method === 'GET') {
    return first ? ok(db.users.find((u) => u.id === num(first)) ?? null) : ok(db.users);
  }

  /* --------------------------------------------------------------- teams */
  if (resource === 'teams' && !second) {
    const body = (req.body ?? {}) as TeamBody;

    if (method === 'GET' && !first) {
      return ok(db.teams);
    }
    if (method === 'GET' && first) {
      return ok(db.teams.find((team) => team.id === num(first)) ?? null);
    }
    if (method === 'POST') {
      const team: DemoTeam = {
        id: nextId(db),
        name: text(body.name, 'צוות חדש'),
        description: text(body.description),
        members_count: 1,
        created_at: new Date().toISOString(),
      };
      db.teams.push(team);
      save(db);
      return ok(team, 201);
    }
    if ((method === 'PATCH' || method === 'PUT') && first) {
      const team = db.teams.find((candidate) => candidate.id === num(first));
      if (!team) {
        return ok(null, 200);
      }
      team.name = text(body.name, team.name);
      team.description = typeof body.description === 'string' ? body.description : team.description;
      save(db);
      return ok(team);
    }
    if (method === 'DELETE' && first) {
      const teamId = num(first);
      const projectIds = db.projects.filter((p) => p.team_id === teamId).map((p) => p.id);
      const taskIds = db.tasks.filter((t2) => projectIds.includes(t2.project_id)).map((t2) => t2.id);
      db.teams = db.teams.filter((team) => team.id !== teamId);
      db.projects = db.projects.filter((p) => p.team_id !== teamId);
      db.tasks = db.tasks.filter((t2) => !taskIds.includes(t2.id));
      db.comments = db.comments.filter((comment) => !taskIds.includes(comment.task_id));
      save(db);
      return ok({ success: true, id: teamId });
    }
  }

  // Nested reads such as /teams/:id/projects
  if (resource === 'teams' && second === 'projects' && method === 'GET') {
    return ok(db.projects.filter((project) => project.team_id === num(first)));
  }

  /* ------------------------------------------------------------ projects */
  if (resource === 'projects' && !second) {
    const body = (req.body ?? {}) as ProjectBody;

    if (method === 'GET' && !first) {
      const teamFilter = parsed.query.get('teamId') ?? parsed.query.get('team_id');
      const all = db.projects;
      return ok(teamFilter ? all.filter((p) => p.team_id === num(teamFilter)) : all);
    }
    if (method === 'GET' && first) {
      return ok(db.projects.find((p) => p.id === num(first)) ?? null);
    }
    if (method === 'POST') {
      const fallbackTeam: DemoTeam | undefined = db.teams[0];
      const rawTeamId = body.teamId ?? body.team_id;
      const teamId = rawTeamId !== undefined ? num(rawTeamId) : fallbackTeam ? fallbackTeam.id : 1;
      const project: DemoProject = {
        id: nextId(db),
        name: text(body.name, 'פרויקט חדש'),
        description: text(body.description),
        team_id: teamId,
        teamId,
        created_at: new Date().toISOString(),
      };
      db.projects.push(project);
      save(db);
      return ok(project, 201);
    }
    if ((method === 'PATCH' || method === 'PUT') && first) {
      const project = db.projects.find((candidate) => candidate.id === num(first));
      if (!project) {
        return ok(null);
      }
      project.name = text(body.name, project.name);
      project.description =
        typeof body.description === 'string' ? body.description : project.description;
      save(db);
      return ok(project);
    }
    if (method === 'DELETE' && first) {
      const projectId = num(first);
      const taskIds = db.tasks.filter((task) => task.project_id === projectId).map((t2) => t2.id);
      db.projects = db.projects.filter((project) => project.id !== projectId);
      db.tasks = db.tasks.filter((task) => task.project_id !== projectId);
      db.comments = db.comments.filter((comment) => !taskIds.includes(comment.task_id));
      save(db);
      return ok({ success: true, id: projectId });
    }
  }

  // Nested reads such as /projects/:id/tasks
  if (resource === 'projects' && second === 'tasks' && method === 'GET') {
    return ok(db.tasks.filter((task) => task.project_id === num(first)));
  }

  /* --------------------------------------------------------------- tasks */
  if (resource === 'tasks' && !second) {
    const body = (req.body ?? {}) as TaskBody;

    if (method === 'GET' && !first) {
      const projectFilter = parsed.query.get('projectId') ?? parsed.query.get('project_id');
      const statusFilter = parsed.query.get('status');
      let list = db.tasks;
      if (projectFilter) {
        list = list.filter((task) => task.project_id === num(projectFilter));
      }
      if (statusFilter) {
        list = list.filter((task) => task.status === statusFilter);
      }
      return ok(list);
    }
    if (method === 'GET' && first) {
      return ok(db.tasks.find((task) => task.id === num(first)) ?? null);
    }
    if (method === 'POST') {
      const fallbackProject: DemoProject | undefined = db.projects[0];
      const rawProjectId = body.projectId ?? body.project_id;
      const projectId =
        rawProjectId !== undefined ? num(rawProjectId) : fallbackProject ? fallbackProject.id : 1;
      const task: DemoTask = {
        id: nextId(db),
        title: text(body.title, 'משימה חדשה'),
        description: text(body.description),
        priority: text(body.priority, 'Medium'),
        status: text(body.status, 'todo'),
        project_id: projectId,
        projectId,
        created_at: new Date().toISOString(),
      };
      db.tasks.push(task);
      save(db);
      return ok(task, 201);
    }
    if ((method === 'PATCH' || method === 'PUT') && first) {
      const task = db.tasks.find((candidate) => candidate.id === num(first));
      if (!task) {
        return ok(null);
      }
      task.title = text(body.title, task.title);
      task.description = typeof body.description === 'string' ? body.description : task.description;
      task.priority = text(body.priority, task.priority);
      task.status = text(body.status, task.status);
      if (body.projectId !== undefined || body.project_id !== undefined) {
        const moved = num(body.projectId ?? body.project_id);
        task.project_id = moved;
        task.projectId = moved;
      }
      save(db);
      return ok(task);
    }
    if (method === 'DELETE' && first) {
      const taskId = num(first);
      db.tasks = db.tasks.filter((task) => task.id !== taskId);
      db.comments = db.comments.filter((comment) => comment.task_id !== taskId);
      save(db);
      return ok({ success: true, id: taskId });
    }
  }

  // Nested reads such as /tasks/:id/comments
  if (resource === 'tasks' && (second === 'comments' || second === 'notes')) {
    const taskId = num(first);
    if (method === 'GET') {
      return ok(db.comments.filter((comment) => comment.task_id === taskId));
    }
    if (method === 'POST') {
      return ok(addComment(db, taskId, (req.body ?? {}) as CommentBody), 201);
    }
  }

  /* --------------------------------------------------- comments / notes */
  if (resource === 'comments' || resource === 'notes') {
    const body = (req.body ?? {}) as CommentBody;

    if (method === 'GET' && !first) {
      const taskFilter = parsed.query.get('taskId') ?? parsed.query.get('task_id');
      return ok(
        taskFilter
          ? db.comments.filter((comment) => comment.task_id === num(taskFilter))
          : db.comments,
      );
    }
    if (method === 'POST' && !first) {
      return ok(addComment(db, num(body.taskId), body), 201);
    }
    if (method === 'DELETE' && first) {
      const commentId = num(first);
      db.comments = db.comments.filter((comment) => comment.id !== commentId);
      save(db);
      return ok({ success: true, id: commentId });
    }
  }

  // Anything unrecognised keeps its normal path instead of being swallowed.
  return next(req);
};

function addComment(db: DemoDb, taskId: number, body: CommentBody): DemoComment {
  const comment: DemoComment = {
    id: nextId(db),
    task_id: taskId,
    taskId,
    body: text(body.body, ''),
    author_name: currentUserName(db),
    created_at: new Date().toISOString(),
  };
  db.comments.push(comment);
  save(db);
  return comment;
}

function currentUserName(db: DemoDb): string {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsedUser = JSON.parse(raw) as Partial<DemoUser>;
      const name = text(parsedUser.name, '');
      if (name) {
        return name;
      }
      const email = text(parsedUser.email, '');
      if (email) {
        return email.split('@')[0] || 'You';
      }
    }
  } catch {
    // fall through to the seeded user
  }
  const seeded: DemoUser | undefined = db.users[0];
  return seeded ? seeded.name : 'You';
}

let hookInstalled = false;

function installResetHook(): void {
  if (hookInstalled || typeof window === 'undefined') {
    return;
  }
  hookInstalled = true;
  window.__resetDemo = () => {
    cache = null;
    try {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch {
      // nothing to clean up
    }
    console.info('Demo store cleared. Reload the page to start from the seed data.');
  };
}
