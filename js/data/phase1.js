/* ============================================================
   phase1.js — Phase 1: Core Java Fundamentals
   Registers lesson + quiz content under window.APP_DATA.
   ============================================================ */
(function () {
  "use strict";

  window.APP_DATA = window.APP_DATA || { phases: [] };

  var oopLesson = {
    intro:
      "Object-Oriented Programming (OOP) is the way you organize Java code so that it models the real world. Instead of scattering data and logic across the whole file, you bundle them into objects: little self-contained units that hold state and the behaviour that operates on that state. Java is built around this idea, so every Spring service, every REST controller, every entity you write in a real job is an OOP design decision.",
    sections: [
      {
        heading: "The four pillars at a glance",
        body:
          "OOP rests on four ideas. You will use all four every single day as a Java developer, often without naming them:\n\n" +
          "1. Encapsulation — keep data private and expose only what is safe to expose.\n" +
          '2. Abstraction — hide the messy "how" behind a clean "what".\n' +
          "3. Inheritance — reuse shared behaviour by extending an existing type.\n" +
          "4. Polymorphism — call the same method on different types and get behaviour appropriate to each.\n\n" +
          "A quick mental model: encapsulation is about *access*, abstraction is about *hiding complexity*, inheritance is about *reuse via a hierarchy*, and polymorphism is about *one interface, many implementations*.",
      },
      {
        heading: "Encapsulation — think of a bank account",
        body:
          "A bank account does not let you reach in and set the balance to whatever you want. You must go through deposit() and withdraw(), which enforce the rules (no negative deposits, no overdrafts unless allowed). The balance field is private; the methods are public. That is encapsulation.\n\n" +
          "Real backend example: a Spring @Service that exposes a payOrder(orderId) method while hiding the internal steps (fetch order, validate, call payment gateway, update status). Callers cannot accidentally skip validation because the internals are private.",
        code:
          "public class BankAccount {\n" +
          "    private final String accountNumber;\n" +
          "    private long balanceCents;\n" +
          "\n" +
          "    public BankAccount(String accountNumber, long openingBalanceCents) {\n" +
          "        if (openingBalanceCents < 0) {\n" +
          '            throw new IllegalArgumentException("Opening balance cannot be negative");\n' +
          "        }\n" +
          "        this.accountNumber = accountNumber;\n" +
          "        this.balanceCents = openingBalanceCents;\n" +
          "    }\n" +
          "\n" +
          "    public void deposit(long cents) {\n" +
          "        if (cents <= 0) {\n" +
          '            throw new IllegalArgumentException("Deposit must be positive");\n' +
          "        }\n" +
          "        balanceCents += cents;\n" +
          "    }\n" +
          "\n" +
          "    public void withdraw(long cents) {\n" +
          '        if (cents <= 0) throw new IllegalArgumentException("Withdrawal must be positive");\n' +
          '        if (cents > balanceCents) throw new IllegalStateException("Insufficient funds");\n' +
          "        balanceCents -= cents;\n" +
          "    }\n" +
          "\n" +
          "    public long getBalanceCents() {\n" +
          "        return balanceCents;\n" +
          "    }\n" +
          "}",
      },
      {
        heading: "Abstraction — a payment gateway",
        body:
          "Abstraction is about designing a simple interface that hides a complicated implementation. When you charge a card, you do not want to know whether the processor is Stripe, Adyen, or a legacy SOAP service. You want one method: charge(amount, token).\n\n" +
          'In Java you express abstraction with interfaces and abstract classes. An interface is a contract: "any type that claims to be a PaymentGateway must provide a charge method".',
        code:
          "public interface PaymentGateway {\n" +
          "    PaymentResult charge(long amountCents, String token);\n" +
          "}\n" +
          "\n" +
          "public class StripeGateway implements PaymentGateway {\n" +
          "    @Override\n" +
          "    public PaymentResult charge(long amountCents, String token) {\n" +
          "        // Real implementation would call the Stripe SDK here.\n" +
          '        return new PaymentResult(true, "stripe_txn_123");\n' +
          "    }\n" +
          "}\n" +
          "\n" +
          "public class OrderService {\n" +
          "    private final PaymentGateway gateway;\n" +
          "\n" +
          "    public OrderService(PaymentGateway gateway) {\n" +
          "        this.gateway = gateway;\n" +
          "    }\n" +
          "\n" +
          "    public void pay(Order order, String token) {\n" +
          "        PaymentResult result = gateway.charge(order.getTotalCents(), token);\n" +
          "        if (!result.isSuccessful()) {\n" +
          "            throw new PaymentFailedException(result.getReference());\n" +
          "        }\n" +
          "    }\n" +
          "}",
      },
      {
        heading: "Inheritance — avoid copy-paste between related types",
        body:
          "Inheritance lets a class reuse and refine another class. A Dog is an Animal, so Dog extends Animal and inherits shared behaviour (eat, sleep) while adding its own (fetch, bark).\n\n" +
          'The dangerous trap: using inheritance just to reuse code. A Stack is not really a Vector; if you extend Vector to build a Stack, callers can still call insertElementAt() and break the invariant. Prefer composition (holding another object as a field) unless the "is-a" relationship is truly clean. In backend code, inheritance is common for exception hierarchies (e.g. PaymentFailedException extends RuntimeException) and abstract base classes, but less common between services.',
        code:
          "public abstract class Animal {\n" +
          "    protected final String name;\n" +
          "\n" +
          "    protected Animal(String name) {\n" +
          "        this.name = name;\n" +
          "    }\n" +
          "\n" +
          "    public void eat() {\n" +
          '        System.out.println(name + " is eating");\n' +
          "    }\n" +
          "\n" +
          "    public abstract String speak();\n" +
          "}\n" +
          "\n" +
          "public class Dog extends Animal {\n" +
          "    public Dog(String name) {\n" +
          "        super(name);\n" +
          "    }\n" +
          "\n" +
          "    @Override\n" +
          "    public String speak() {\n" +
          '        return "Woof";\n' +
          "    }\n" +
          "}",
      },
      {
        heading: "Polymorphism — same call, different behaviour",
        body:
          "Polymorphism means a single method call can produce different behaviour depending on the actual runtime type. There are two flavours in Java:\n\n" +
          "• Compile-time (static) polymorphism — method overloading. Two methods with the same name but different parameter lists.\n" +
          "• Runtime (dynamic) polymorphism — method overriding. The JVM picks the most specific override based on the object's real class, resolved through the virtual method table.\n\n" +
          "A clean backend example: a NotificationSender interface with implementations EmailSender, SmsSender, and PushSender. Your AlertService holds a List<NotificationSender> and calls send(...) on each. Adding a new channel means adding a class, not modifying the service — this is the Open/Closed Principle in practice.",
        code:
          "public interface NotificationSender {\n" +
          "    void send(String recipient, String message);\n" +
          "}\n" +
          "\n" +
          "public class EmailSender implements NotificationSender {\n" +
          "    @Override\n" +
          "    public void send(String recipient, String message) {\n" +
          '        System.out.println("EMAIL to " + recipient + ": " + message);\n' +
          "    }\n" +
          "}\n" +
          "\n" +
          "public class SmsSender implements NotificationSender {\n" +
          "    @Override\n" +
          "    public void send(String recipient, String message) {\n" +
          '        System.out.println("SMS to " + recipient + ": " + message);\n' +
          "    }\n" +
          "}\n" +
          "\n" +
          "public class AlertService {\n" +
          "    private final List<NotificationSender> senders;\n" +
          "\n" +
          "    public AlertService(List<NotificationSender> senders) {\n" +
          "        this.senders = senders;\n" +
          "    }\n" +
          "\n" +
          "    public void alert(String recipient, String message) {\n" +
          "        for (NotificationSender sender : senders) {\n" +
          "            sender.send(recipient, message);\n" +
          "        }\n" +
          "    }\n" +
          "}",
      },
    ],
    whyItMatters:
      "Every Spring Boot application is a web of objects wired together by dependency injection. @Service, @Repository, and @RestController are all just classes that follow OOP principles. Interfaces (abstraction) let Spring swap implementations for testing. Encapsulation keeps your entities consistent. Polymorphism powers the strategy pattern you will use for things like payment providers and notification channels. If your OOP is shaky, Spring feels like magic; once OOP clicks, Spring feels obvious.",
    commonMistakes: [
      'Making every field public "for convenience" — this breaks encapsulation and makes refactoring dangerous later.',
      "Using inheritance purely to reuse code when composition would be safer (the classic Stack extends Vector mistake).",
      "Forgetting that overriding requires the same signature and a compatible return type; a typo silently creates an overload instead of an override. Always add @Override.",
      "Storing mutable objects in final fields and assuming they are immutable — final only prevents reassignment, not mutation of the object's contents.",
      "Confusing abstraction (designing a simple interface) with encapsulation (controlling access to data). They often appear together but are distinct ideas.",
      "Overusing abstract classes when an interface would do. Interfaces are easier to test and compose.",
    ],
    interviewAngle: {
      question:
        "Can you explain the four pillars of OOP and give a real example of each from backend development?",
      answer:
        'Sure. Encapsulation is about protecting an object\'s state and only exposing safe operations — for example, a Spring @Service exposes a payOrder method while keeping validation and gateway calls private. Abstraction is about hiding complexity behind a simple contract — like a PaymentGateway interface with a single charge method, so the rest of the app does not care whether it is Stripe or Adyen. Inheritance is reuse through a true "is-a" relationship — like a PaymentFailedException extending RuntimeException, or an abstract base class for shared repository logic. Polymorphism is one call, many behaviours — for example, a List<NotificationSender> where each element might be EmailSender, SmsSender, or PushSender; calling send() dispatches to the right implementation at runtime. In day-to-day Spring work, I lean on abstraction and polymorphism the most, because they let me swap implementations for testing and add features without modifying existing services.',
    },
    summary:
      'OOP is the vocabulary of Java. Encapsulation protects state, abstraction hides complexity, inheritance shares behaviour through clean "is-a" hierarchies, and polymorphism lets one call adapt to many types. Get comfortable with interfaces, @Override, and the composition-over-inheritance rule, and everything you build in Spring Boot will feel intentional instead of accidental.',
  };

  var oopQuiz = [
    {
      id: "oop-q1",
      type: "multiple-choice",
      question:
        'Which OOP principle is best described as "protecting an object\'s internal state and only exposing safe operations"?',
      options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
      correctIndex: 0,
      explanation:
        "Encapsulation is about controlling access to an object's data — typically by making fields private and exposing public methods that enforce invariants. Abstraction is about hiding complexity behind a simple contract, which is related but distinct.",
    },
    {
      id: "oop-q2",
      type: "multiple-choice",
      question:
        "You want the rest of your application to call `gateway.charge(amount, token)` without knowing whether the implementation is Stripe, Adyen, or a test double. Which OOP pillar are you primarily applying?",
      options: ["Encapsulation", "Inheritance", "Abstraction", "Overloading"],
      correctIndex: 2,
      explanation:
        "Abstraction hides the implementation details behind a simple interface (PaymentGateway). The caller depends only on the contract, so implementations can be swapped freely — which is exactly what makes this pattern so valuable in Spring.",
    },
    {
      id: "oop-q3",
      type: "code-output",
      question: "What does this program print?",
      code:
        "class Animal {\n" +
        '    String speak() { return "?"; }\n' +
        "}\n" +
        "\n" +
        "class Dog extends Animal {\n" +
        "    @Override\n" +
        '    String speak() { return "Woof"; }\n' +
        "}\n" +
        "\n" +
        "public class Main {\n" +
        "    public static void main(String[] args) {\n" +
        "        Animal a = new Dog();\n" +
        "        System.out.println(a.speak());\n" +
        "    }\n" +
        "}",
      options: ["?", "Woof", "Compilation error", "Runtime exception"],
      correctIndex: 1,
      explanation:
        'This is runtime polymorphism. Even though the variable `a` is declared as Animal, the actual object is a Dog. The JVM dispatches speak() to Dog\'s override at runtime, so it prints "Woof".',
    },
    {
      id: "oop-q4",
      type: "spot-the-bug",
      question:
        "A teammate wrote this class. What is the most serious OOP problem?",
      code:
        "public class BankAccount {\n" +
        "    public long balanceCents;\n" +
        "\n" +
        "    public BankAccount(long opening) {\n" +
        "        this.balanceCents = opening;\n" +
        "    }\n" +
        "}",
      options: [
        "The field is public, so any code can set it to an invalid value like -999999, breaking the account invariant.",
        "The constructor should be private.",
        "The field should be static.",
        "The class should extend Object explicitly.",
      ],
      correctIndex: 0,
      explanation:
        "Encapsulation is broken. Because balanceCents is public, callers can bypass any validation and directly assign arbitrary values. The fix is to make the field private and expose deposit/withdraw methods (and a read-only getter) that enforce the rules.",
    },
    {
      id: "oop-q5",
      type: "multiple-choice",
      question: "Which statement about inheritance in Java is TRUE?",
      options: [
        "A class can extend multiple classes.",
        "Inheritance is always the best way to reuse code from another class.",
        "A class can implement multiple interfaces but extend only one class.",
        "Private methods of a superclass are inherited and overridable.",
      ],
      correctIndex: 2,
      explanation:
        "Java supports single class inheritance but multiple interface implementation. Inheritance is not always the right tool for reuse — composition is often safer. Private methods are not inherited in the accessible sense and cannot be overridden.",
    },
    {
      id: "oop-q6",
      type: "multiple-choice",
      question:
        "In a Spring Boot service, you inject a `PaymentGateway` interface rather than a concrete `StripeGateway`. Which OOP principle does this mainly leverage?",
      options: [
        "Encapsulation, because the gateway hides its fields.",
        "Abstraction, because the service depends on a contract, not an implementation.",
        "Inheritance, because StripeGateway extends PaymentGateway.",
        "Overloading, because charge() has multiple signatures.",
      ],
      correctIndex: 1,
      explanation:
        "Depending on the interface rather than the concrete class is abstraction. It decouples the service from the implementation, which is exactly what enables mocking in tests and swapping providers without touching the service.",
    },
    {
      id: "oop-q7",
      type: "code-output",
      question: "What does this print?",
      code:
        "public class Counter {\n" +
        "    private int count;\n" +
        "\n" +
        "    public void increment() { count++; }\n" +
        "    public int getCount() { return count; }\n" +
        "\n" +
        "    public static void main(String[] args) {\n" +
        "        Counter c = new Counter();\n" +
        "        c.increment();\n" +
        "        c.increment();\n" +
        "        System.out.println(c.getCount());\n" +
        "    }\n" +
        "}",
      options: ["0", "1", "2", "Compilation error"],
      correctIndex: 2,
      explanation:
        "Each call to increment() adds 1 to the instance field count. Two calls make it 2. The field is private, so this is also a small example of encapsulation — outside code cannot read or modify count directly, only through getCount().",
    },
    {
      id: "oop-q8",
      type: "spot-the-bug",
      question:
        "This code was supposed to override the parent method, but something is wrong. What is the issue?",
      code:
        "class Parent {\n" +
        '    public String greet() { return "hi"; }\n' +
        "}\n" +
        "\n" +
        "class Child extends Parent {\n" +
        '    public String greet(String name) { return "hi " + name; }\n' +
        "}",
      options: [
        "greet in Child is an overload, not an override, because the parameter list differs. Adding @Override would have caught this at compile time.",
        "Child cannot define a method named greet at all.",
        "Parent.greet must be abstract for Child to define greet.",
        "The return type must be void.",
      ],
      correctIndex: 0,
      explanation:
        "Overriding requires the same method signature. Because Child.greet takes a String parameter, it is a different method — an overload. If the developer had written @Override, the compiler would have rejected it, which is exactly why @Override is a best practice.",
    },
    {
      id: "oop-q9",
      type: "multiple-choice",
      question:
        'Which design best follows the "prefer composition over inheritance" guideline?',
      options: [
        "class Stack extends Vector { ... }",
        "class Car extends Engine { ... }",
        "class Car { private final Engine engine; }",
        "class Dog extends Animal { ... } where Dog truly is an Animal",
      ],
      correctIndex: 2,
      explanation:
        "A Car is not a kind of Engine, so inheritance is wrong. Holding an Engine as a private field is composition. The Stack extends Vector example is the classic anti-pattern where inherited methods can violate the Stack contract.",
    },
    {
      id: "oop-q10",
      type: "multiple-choice",
      question:
        'You are asked in an interview: "What is the difference between abstraction and encapsulation?" Which answer is strongest?',
      options: [
        "They are the same thing with different names.",
        "Encapsulation is about hiding data with private fields and public methods; abstraction is about hiding complexity behind a simple contract such as an interface.",
        "Encapsulation only applies to classes; abstraction only applies to methods.",
        "Abstraction is a runtime concept; encapsulation is a compile-time concept.",
      ],
      correctIndex: 1,
      explanation:
        "Encapsulation controls access to state (private fields, validated public methods). Abstraction hides implementation complexity behind a simple interface or abstract class. They often appear together — an interface (abstraction) with implementations that keep their fields private (encapsulation) — but they are distinct ideas.",
    },
  ];

  window.APP_DATA.phases.push({
    id: "phase-1",
    number: 1,
    title: "Core Java Fundamentals",
    description:
      "The language itself — OOP, collections, exceptions, concurrency, Java 8, and the JVM.",
    topics: [
      {
        id: "oop",
        title: "OOP Principles",
        type: "lesson",
        lesson: oopLesson,
        quiz: oopQuiz,
      },
      { id: "collections", title: "Collections Framework", type: "lesson" },
      {
        id: "map-comparison",
        title: "HashMap vs Hashtable vs ConcurrentHashMap",
        type: "lesson",
      },
      { id: "exceptions", title: "Exception Handling", type: "lesson" },
      { id: "multithreading", title: "Multithreading Basics", type: "lesson" },
      { id: "java8", title: "Java 8 Features", type: "lesson" },
      { id: "jvm", title: "JVM Basics", type: "lesson" },
    ],
    finalQuiz: null,
  });
})();
