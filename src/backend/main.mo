import Float "mo:core/Float";
import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type ReagentRow = {
    name : Text;
    price : Float;
    volume : Float;
    mlCost : Float;
    cpt : Float;
  };

  type Session = {
    name : Text;
    divisor : Float;
    reagents : [ReagentRow];
  };

  let sessions = Map.empty<Text, Session>();

  public shared ({ caller }) func saveSession(id : Text, name : Text, divisor : Float, reagents : [(Text, Float, Float)]) : async () {
    let reagentRows = List.empty<ReagentRow>();

    for ((reagentName, price, volume) in reagents.values()) {
      if (volume == 0.0) { Runtime.trap("Volume cannot be zero. ") };
      let mlCost = price / volume;
      let cpt = mlCost / divisor;
      reagentRows.add({
        name = reagentName;
        price;
        volume;
        mlCost;
        cpt;
      });
    };

    let session : Session = {
      name;
      divisor;
      reagents = reagentRows.toArray();
    };

    sessions.add(id, session);
  };

  public query ({ caller }) func getSession(id : Text) : async Session {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session with id " # id # " not found. ") };
      case (?session) { session };
    };
  };

  public query ({ caller }) func listSessions() : async [(Text, Session)] {
    sessions.toArray();
  };

  public shared ({ caller }) func deleteSession(id : Text) : async () {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session with id " # id # " not found. ") };
      case (?_) {
        sessions.remove(id);
      };
    };
  };
};
